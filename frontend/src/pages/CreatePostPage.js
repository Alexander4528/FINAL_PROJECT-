import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  Plus,
  Type,
  FileText,
  Hash
} from 'lucide-react';
import { createPost } from '../services/api';
import toast from 'react-hot-toast';

const postSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters'),
  excerpt: z.string()
    .max(300, 'Excerpt must not exceed 300 characters')
    .optional(),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      tags: [],
    },
  });

  const content = watch('content');
  const tags = watch('tags') || [];

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    const newTag = trimmedTag.toLowerCase();
    if (tags.includes(newTag)) {
      toast.error('Tag already exists');
      return;
    }

    if (tags.length >= 10) {
      toast.error('Maximum 10 tags allowed');
      return;
    }

    setValue('tags', [...tags, newTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
  try {
    console.log('Создание поста:', data);
    
    const result = await createPost(data);
    console.log('Успешно создан:', result);
    alert('Пост успешно создан!');
    navigate('/');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Ошибка при создании поста: ' + error.message);
  }
};

  const generateExcerpt = () => {
    const content = getValues('content');
    if (content.length <= 300) {
      setValue('excerpt', content);
    } else {
      setValue('excerpt', content.substring(0, 297) + '...');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share your thoughts, ideas, and knowledge with the community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Type size={16} className="inline mr-2" />
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="input text-2xl font-bold"
            placeholder="Your post title..."
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.title?.message}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {watch('title')?.length || 0}/200 characters
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Featured Image (Optional)
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                aria-label="Remove image"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="btn btn-outline">
                  Choose an image
                </span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText size={16} className="inline mr-2" />
              Content
            </label>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {previewMode ? (
                <>
                  <EyeOff size={16} />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Eye size={16} />
                  <span>Preview</span>
                </>
              )}
            </button>
          </div>

          {previewMode ? (
            <div className="prose prose-lg dark:prose-invert max-w-none p-4 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[400px]">
              <ReactMarkdown>{content}</ReactMarkdown>
              {!content && (
                <p className="text-gray-400 italic">Content will appear here...</p>
              )}
            </div>
          ) : (
            <textarea
              id="content"
              {...register('content')}
              className="textarea min-h-[400px] font-mono text-sm"
              placeholder="Start writing your post here... (Markdown supported)"
              disabled={isSubmitting}
            />
          )}
          <div className="flex justify-between mt-1">
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.content?.message}
            </span>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-x-4">
              <span>{content?.length || 0} characters</span>
              <span>{content?.split(/\s+/).length || 0} words</span>
              <span>~{Math.ceil((content?.split(/\s+/).length || 0) / 200)} min read</span>
            </div>
          </div>

          {/* Markdown Tips */}
          {!previewMode && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Markdown tips:</p>
              <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                <code># Header</code>
                <code>**bold**</code>
                <code>*italic*</code>
                <code>[link](url)</code>
                <code>`code`</code>
                <code>- list item</code>
                <code>{'>'} quote</code>
                <code>![alt](image-url)</code>
              </div>
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Excerpt (Optional)
            </label>
            <button
              type="button"
              onClick={generateExcerpt}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Generate from content
            </button>
          </div>
          <textarea
            id="excerpt"
            {...register('excerpt')}
            className="textarea"
            placeholder="Brief summary of your post..."
            rows="3"
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.excerpt?.message}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {watch('excerpt')?.length || 0}/300 characters
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Hash size={16} className="inline mr-2" />
            Tags
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input"
              placeholder="Add a tag..."
              disabled={isSubmitting || tags.length >= 10}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn btn-outline flex items-center space-x-1"
              disabled={isSubmitting || tags.length >= 10}
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
          
          {errors.tags && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              {errors.tags.message}
            </p>
          )}

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    aria-label={`Remove ${tag}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Add up to 10 tags to help readers discover your post
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 space-y-reverse">
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => {
                const formData = getValues();
                console.log('Draft saved:', formData);
                toast.success('Draft saved locally');
              }}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;