import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { 
  Calendar, 
  User, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Edit, 
  Trash2, 
  Share2,
  ArrowLeft,
  MoreVertical,
  Tag,
  Eye
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getPost, deletePost, likePost, favoritePost } from '../services/api';
import CommentList from '../components/CommentList';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPost(id);
      setPost(response.data.post);
      setComments(response.data.post.comments || []);
    } catch (err) {
      setError(err);
      toast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    
    try {
      const response = await likePost(id);
      setPost(prev => ({
        ...prev,
        userLike: response.data.liked,
        _count: {
          ...prev._count,
          likes: prev._count.likes + (response.data.liked ? 1 : -1)
        }
      }));
      toast.success(response.data.liked ? 'Post liked!' : 'Post unliked');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to like post');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save posts');
      return;
    }
    
    try {
      const response = await favoritePost(id);
      setPost(prev => ({
        ...prev,
        userFavorite: response.data.favorited
      }));
      toast.success(response.data.favorited ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to favorite post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deletePost(id);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete post');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const canEdit = user && (user.id === post?.author.id || user.role === 'ADMIN');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">😕</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Post not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to posts
        </Link>
      </div>

      {/* Post Header */}
      <header className="mb-8">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/search?tag=${tag.name}`}
                className="tag"
              >
                <Tag size={14} className="mr-1" />
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {post.excerpt}
          </p>
        )}

        {/* Author and Metadata */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to={`/users/${post.author.id}`}
              className="flex items-center space-x-3 group"
            >
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.username}
                  className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 group-hover:border-blue-400 transition-colors"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <User size={24} className="text-white" />
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.author.username}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={12} />
                  <time dateTime={post.createdAt}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </time>
                  {post.updatedAt !== post.createdAt && (
                    <>
                      <span>•</span>
                      <span>Updated</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Stats */}
            <div className="hidden md:flex items-center space-x-4 mr-4">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <Eye size={18} />
                <span className="text-sm">{(post._count?.views || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <Heart size={18} />
                <span className="text-sm">{post._count?.likes || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <MessageCircle size={18} />
                <span className="text-sm">{post._count?.comments || 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors ${
                post.userLike
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
              aria-label={post.userLike ? 'Unlike post' : 'Like post'}
            >
              <Heart size={20} className={post.userLike ? 'fill-current' : ''} />
            </button>

            <button
              onClick={handleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                post.userFavorite
                  ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
              aria-label={post.userFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Bookmark size={20} className={post.userFavorite ? 'fill-current' : ''} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              aria-label="Share post"
            >
              <Share2 size={20} />
            </button>

            {/* Options Dropdown */}
            {canEdit && (
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical size={20} />
                </button>

                {showOptions && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowOptions(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <Link
                        to={`/posts/${id}/edit`}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowOptions(false)}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit Post
                      </Link>
                      <button
                        onClick={() => {
                          setShowOptions(false);
                          handleDelete();
                        }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Post
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.imageUrl && (
        <div className="mb-8">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <Tag size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tags
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/search?tag=${tag.name}`}
                className="tag"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {post.author.bio && (
        <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <div className="flex items-start space-x-4">
            <Link to={`/users/${post.author.id}`}>
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.username}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
              )}
            </Link>
            <div>
              <Link
                to={`/users/${post.author.id}`}
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {post.author.username}
              </Link>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {post.author.bio}
              </p>
              <Link
                to={`/users/${post.author.id}`}
                className="inline-block mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <section id="comments" className="scroll-mt-8">
        <CommentList
          comments={comments}
          postId={id}
          onCommentsUpdate={setComments}
        />
      </section>
    </article>
  );
};

export default PostPage;