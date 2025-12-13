import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };
  
  const colorClasses = {
    primary: 'border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400',
    white: 'border-gray-300 border-t-white dark:border-gray-600 dark:border-t-white',
    danger: 'border-gray-300 border-t-red-600 dark:border-gray-600 dark:border-t-red-400',
    success: 'border-gray-300 border-t-green-600 dark:border-gray-600 dark:border-t-green-400',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;