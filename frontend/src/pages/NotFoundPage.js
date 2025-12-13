import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full mx-auto flex items-center justify-center">
            <AlertTriangle size={64} className="text-red-500 dark:text-red-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">404</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you&apos;re looking for seems to have wandered off into the digital void.
        </p>

        {/* Search */}
        <div className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Try searching for what you need:
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for posts, users, or topics..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
                }
              }}
            />
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/"
            className="btn btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline flex items-center justify-center space-x-2 py-3"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
          
          <Link
            to="/search"
            className="btn btn-outline flex items-center justify-center space-x-2 py-3"
          >
            <Search size={20} />
            <span>Explore</span>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Latest Posts', path: '/' },
              { label: 'Popular Tags', path: '/search' },
              { label: 'Top Writers', path: '/users' },
              { label: 'Create Post', path: '/create' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Need Help?
          </h4>
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            If you believe this is an error, please{' '}
            <a href="mailto:support@blogplatform.com" className="underline">
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;