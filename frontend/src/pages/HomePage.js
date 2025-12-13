import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, Clock, Users, Filter } from 'lucide-react';
import PostList from '../components/PostList';
import Pagination from '../components/Pagination';
import { getPosts } from '../services/api';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 1,
    hasMore: false
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [tag, setTag] = useState(searchParams.get('tag') || '');

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        sort: sortBy,
        ...(tag && { tag })
      };
      
      const response = await getPosts(params);
      const { posts: fetchedPosts, pagination: fetchedPagination } = response.data;
      
      if (page === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts(prev => [...prev, ...fetchedPosts]);
      }
      
      setPagination(fetchedPagination);
    } catch (err) {
      setError(err);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    fetchPosts(page);
  }, [searchParams, sortBy, tag]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.delete('page');
    setSearchParams(params);
  };

  const handleTagClick = (tagName) => {
    setTag(tagName);
    const params = new URLSearchParams(searchParams);
    params.set('tag', tagName);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setTag('');
    setSortBy('newest');
    setSearchParams({});
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  // Popular tags (could come from API)
  const popularTags = [
    'JavaScript', 'React', 'Node.js', 'TypeScript', 'Web Development',
    'Programming', 'Tutorial', 'Tips', 'Beginner', 'Advanced'
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Share Your Ideas with the World
        </h1>
        <p className="text-xl mb-6 text-blue-100">
          A platform for developers, writers, and thinkers to share knowledge and connect.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/create"
            className="btn bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 text-lg"
          >
            Start Writing
          </Link>
          <Link
            to="/search"
            className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 text-lg"
          >
            Explore Posts
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                <Filter size={20} className="inline mr-2" />
                Filters
              </h3>
              {(sortBy !== 'newest' || tag) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                Sort by
              </h4>
              <div className="space-y-2">
                {[
                  { value: 'newest', label: 'Newest', icon: <Clock size={16} /> },
                  { value: 'popular', label: 'Popular', icon: <TrendingUp size={16} /> },
                  { value: 'oldest', label: 'Oldest', icon: <Clock size={16} /> }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors ${
                      sortBy === option.value
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                Popular Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tagName) => (
                  <button
                    key={tagName}
                    onClick={() => handleTagClick(tagName)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      tag === tagName
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    #{tagName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <TrendingUp size={20} className="inline mr-2" />
              Platform Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Posts', value: '1,234', icon: '📝' },
                { label: 'Active Users', value: '567', icon: '👥' },
                { label: 'Comments', value: '8,901', icon: '💬' },
                { label: 'Likes', value: '23,456', icon: '❤️' }
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-gray-600 dark:text-gray-400">{stat.label}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Latest Posts
              </h2>
              {tag && (
                <div className="flex items-center mt-2">
                  <span className="text-gray-600 dark:text-gray-400 mr-2">
                    Showing posts tagged:
                  </span>
                  <span className="tag">
                    #{tag}
                    <button
                      onClick={() => handleTagClick('')}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label="Clear tag filter"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 sm:mt-0">
              <Link
                to="/create"
                className="btn btn-primary flex items-center space-x-2"
              >
                <span>✍️</span>
                <span>Write a Post</span>
              </Link>
            </div>
          </div>

          {/* Posts */}
          <PostList
            posts={posts}
            isLoading={isLoading}
            error={error}
            onPostUpdate={handlePostUpdate}
          />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;