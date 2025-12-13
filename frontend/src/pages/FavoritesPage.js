import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, Clock, TrendingUp, Filter, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getPosts } from '../services/api';
import PostList from '../components/PostList';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, sortBy, activeFilter]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      // Note: In a real app, you would have an endpoint for user favorites
      // For now, we'll filter posts that are favorited by the user
      const response = await getPosts({
        page: 1,
        limit: 50, // Get more posts to filter
        sort: sortBy
      });
      
      // Filter posts that the user has favorited
      const favoritedPosts = response.data.posts.filter(post => post.userFavorite);
      setFavorites(favoritedPosts);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromFavorites = (postId) => {
    setFavorites(prev => prev.filter(post => post.id !== postId));
    toast.success('Removed from favorites');
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSortBy('newest');
  };

  const filterOptions = [
    { id: 'all', label: 'All', icon: <Bookmark size={16} /> },
    { id: 'unread', label: 'Unread', icon: <Clock size={16} /> },
    { id: 'popular', label: 'Popular', icon: <TrendingUp size={16} /> },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
  ];

  if (!user) {
    return (
      <div className="text-center py-12">
        <Bookmark size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Please log in
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You need to be logged in to view your favorites
        </p>
        <Link to="/login" className="btn btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              <Bookmark size={32} className="inline mr-3 text-blue-600 dark:text-blue-400" />
              Your Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Posts you've saved for later reading
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {favorites.length} saved
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter size={20} className="text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {(activeFilter !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={16} />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && favorites.length === 0 && (
        <div className="text-center py-12">
          <div className="relative mx-auto w-48 h-48 mb-6">
            <Bookmark size={96} className="text-gray-300 dark:text-gray-600" />
            <Heart size={48} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Save posts you love by clicking the bookmark icon on any post. They'll appear here for easy access later.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn btn-primary">
              Explore Posts
            </Link>
            <Link to="/search" className="btn btn-outline">
              Search for Topics
            </Link>
          </div>
        </div>
      )}

      {/* Favorites List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        favorites.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {favorites.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Total Saved Posts
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {Math.round(favorites.reduce((acc, post) => acc + (post._count?.likes || 0), 0) / favorites.length) || 0}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Avg. Likes per Post
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {new Set(favorites.flatMap(post => post.tags?.map(tag => tag.name) || [])).size}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Unique Tags
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <PostList
                posts={favorites}
                isLoading={false}
                error={null}
                onPostUpdate={(updatedPost) => {
                  if (!updatedPost.userFavorite) {
                    handleRemoveFromFavorites(updatedPost.id);
                  } else {
                    setFavorites(prev => prev.map(post => 
                      post.id === updatedPost.id ? updatedPost : post
                    ));
                  }
                }}
              />
            </div>

            {/* Bulk Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Manage Your Collection
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Organize or clean up your saved posts
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Remove all favorites?')) {
                        setFavorites([]);
                        toast.success('All favorites removed');
                      }
                    }}
                    className="btn btn-outline text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      const unreadPosts = favorites.filter(post => !post.read);
                      setFavorites(unreadPosts);
                      toast.success(`Removed ${favorites.length - unreadPosts.length} read posts`);
                    }}
                    className="btn btn-outline"
                  >
                    Remove Read Posts
                  </button>
                  <button
                    onClick={() => {
                      // In a real app, you would export to JSON
                      const exportData = {
                        exportedAt: new Date().toISOString(),
                        count: favorites.length,
                        posts: favorites.map(post => ({
                          id: post.id,
                          title: post.title,
                          author: post.author.username,
                          url: `${window.location.origin}/posts/${post.id}`,
                          savedAt: new Date().toISOString()
                        }))
                      };
                      
                      const dataStr = JSON.stringify(exportData, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      
                      const exportFileDefaultName = `favorites-${new Date().toISOString().split('T')[0]}.json`;
                      
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                      
                      toast.success('Favorites exported successfully');
                    }}
                    className="btn btn-primary"
                  >
                    Export to JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default FavoritesPage;