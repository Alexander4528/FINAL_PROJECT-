import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Upload, 
  X,
  Globe,
  MapPin,
  Briefcase,
  Hash
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { updateUser } from '../services/api';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z.string()
    .email('Please enter a valid email address')
    .optional(),
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  avatar: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  location: z.string()
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  occupation: z.string()
    .max(100, 'Occupation must not exceed 100 characters')
    .optional(),
  currentPassword: z.string()
    .optional(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/\d/, 'Password must contain at least one number')
    .optional(),
  confirmPassword: z.string()
    .optional(),
}).refine((data) => {
  if (data.password && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to change password",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don&apos;t match",
  path: ["confirmPassword"],
});

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser: updateAuthUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      website: user?.website || '',
      location: user?.location || '',
      occupation: user?.occupation || '',
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Image size must be less than 2MB');
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setValue('avatar', reader.result, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setValue('avatar', '', { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const submitData = { ...data };
      
      // Remove empty fields and confirmPassword
      delete submitData.confirmPassword;
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      // In a real app, you would upload the avatar file first
      if (avatarFile) {
        // Upload avatar and get URL
        submitData.avatar = avatarPreview; // This would be the uploaded URL
      }

      const response = await updateUser(user.id, submitData);
      
      // Update local auth state
      updateAuthUser(response.data.user);
      
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAvatarFromUsername = () => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-red-400 to-red-600',
      'from-orange-400 to-orange-600',
      'from-green-400 to-green-600',
      'from-teal-400 to-teal-600',
      'from-cyan-400 to-cyan-600',
      'from-indigo-400 to-indigo-600',
    ];
    
    const username = watch('username') || user?.username;
    const colorIndex = username?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    setAvatarPreview('');
    setAvatarFile(null);
    setValue('avatar', '', { shouldDirty: true });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your personal information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Picture
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
            {/* Avatar Preview */}
            <div className="relative">
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    aria-label="Remove avatar"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${watch('username') ? 
                  'from-blue-400 to-purple-600' : 
                  'from-gray-400 to-gray-600'
                } flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg`}>
                  <User size={48} className="text-white" />
                </div>
              )}
            </div>

            {/* Avatar Actions */}
            <div className="flex-grow space-y-4">
              <div>
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="btn btn-outline flex items-center space-x-2">
                    <Upload size={16} />
                    <span>Upload New Photo</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG or GIF, max 2MB
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={generateAvatarFromUsername}
                  className="btn btn-outline flex items-center space-x-2"
                  disabled={isSubmitting}
                >
                  <Hash size={16} />
                  <span>Generate from Username</span>
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Creates a unique gradient based on your username
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  disabled={isSubmitting}
                >
                  Remove Photo
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Your profile will display a generated avatar
                </p>
              </div>
            </div>
          </div>

          <input
            type="hidden"
            {...register('avatar')}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} className="inline mr-2" />
                Username
              </label>
              <input
                id="username"
                type="text"
                {...register('username')}
                className="input"
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="input"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                {...register('bio')}
                className="textarea"
                rows="4"
                placeholder="Tell us about yourself..."
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-1">
                <span className="text-sm text-red-600 dark:text-red-400">
                  {errors.bio?.message}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {watch('bio')?.length || 0}/500 characters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Additional Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe size={16} className="inline mr-2" />
                Website
              </label>
              <input
                id="website"
                type="url"
                {...register('website')}
                className="input"
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.website.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Location
              </label>
              <input
                id="location"
                type="text"
                {...register('location')}
                className="input"
                placeholder="City, Country"
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Briefcase size={16} className="inline mr-2" />
                Occupation
              </label>
              <input
                id="occupation"
                type="text"
                {...register('occupation')}
                className="input"
                placeholder="Your profession"
                disabled={isSubmitting}
              />
              {errors.occupation && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.occupation.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Change Password
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock size={16} className="inline mr-2" />
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('currentPassword')}
                  className="input pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} className="text-gray-400" />
                  ) : (
                    <Eye size={20} className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock size={16} className="inline mr-2" />
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400" />
                  ) : (
                    <Eye size={20} className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="md:col-span-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="input pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="text-gray-400" />
                  ) : (
                    <Eye size={20} className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Leave password fields empty if you don&apos;t want to change your password.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 space-y-reverse">
          <div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
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
                const formData = watch();
                console.log('Form data:', formData);
                toast.success('Changes saved locally');
              }}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;