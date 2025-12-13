import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, FileText, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { followUser } from '../services/api';
import toast from 'react-hot-toast';

const UserCard = ({ user, onUpdate }) => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  
  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      return;
    }
    
    if (user.id === currentUser.id) {
      toast.error('You cannot follow yourself');
      return;
    }
    
    try {
      const response = await followUser(user.id);
      if (onUpdate) {
        onUpdate({
          ...user,
          isFollowing: response.data.following
        });
      }
      toast.success(response.data.following ? 'Followed user!' : 'Unfollowed user');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to follow user');
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <Link to={`/users/${user.id}`} className="mb-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              <User size={40} className="text-white" />
            </div>
          )}
        </Link>
        
        {/* Username */}
        <Link to={`/users/${user.id}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {user.username}
          </h3>
        </Link>
        
        {/* Bio */}
        {user.bio && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {user.bio}
          </p>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user._count?.posts || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <FileText size={14} className="mr-1" />
              Posts
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user._count?.followers || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Users size={14} className="mr-1" />
              Followers
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user._count?.following || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Users size={14} className="mr-1" />
              Following
            </div>
          </div>
        </div>
        
        {/* Join Date */}
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
          <Calendar size={14} className="mr-1" />
          Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </div>
        
        {/* Follow Button */}
        {currentUser && user.id !== currentUser.id && (
          <button
            onClick={handleFollow}
            className={`btn w-full ${
              user.isFollowing
                ? 'btn-secondary'
                : 'btn-primary'
            }`}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
        
        {/* View Profile */}
        <Link
          to={`/users/${user.id}`}
          className="btn btn-outline w-full mt-2"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default UserCard;