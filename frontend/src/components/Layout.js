import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';
import { useAuthStore } from '../store/authStore';

const Layout = () => {
  const { isLoading } = useAuthStore();
  const location = useLocation();
  
  // Hide footer on certain pages
  const hideFooter = ['/login', '/register', '/create'].includes(location.pathname);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;