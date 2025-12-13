import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  Calendar, 
  FileText, 
  Users, 
  Edit, 
  Settings,
  Bookmark,
  Heart,
  LogOut,
  Mail,
  Link as LinkIcon,
  MapPin,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUserPosts } from '../services/api';
import PostList from '../components/PostList';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    favorites: 0,
    comments: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await getUserPosts(user.id, { page: 1, limit: 10 });
      setUserPosts(response.data.posts);
      
      // In a real app, you would fetch these stats from the API
      setStats({
        posts: response.data.pagination.total,
        likes: 245, // Example data
        favorites: 42, // Example data
        comments: 156, // Example data
      });
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'posts', label: 'Posts', icon: <FileText size={18} />, count: stats.posts },
    { id: 'favorites', label: 'Favorites', icon: <Bookmark size={18} />, count: stats.favorites },
    { id: 'likes', label: 'Likes', icon: <Heart size={18} />, count: stats.likes },
    { id: 'comments', label: 'Comments', icon: <Users size={18} />, count: stats.comments },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <button
            onClick={() => navigate('/profile/edit')}
            className="absolute top-4 right-4 btn btn-outline bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700"
          >
            <Edit size={16} className="mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            {/* Avatar */}
            <div className="mb-4 md:mb-0 md:mr-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                  <User size={48} className="text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user.username}
                  </h1>
                  {user.bio && (
                    <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                      {user.bio}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Posts', value: stats.posts, icon: <FileText size={20} /> },
                  { label: 'Followers', value: user._count?.followers || 0, icon: <Users size={20} /> },
                  { label: 'Following', value: user._count?.following || 0, icon: <Users size={20} /> },
                  { label: 'Joined', value: formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }), icon: <Calendar size={20} /> },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                
                {/* Example additional fields - you would add these in edit profile */}
                {user.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin size={16} className="mr-3 text-gray-400" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    <LinkIcon size={16} className="mr-3" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer">
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                {user.occupation && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Briefcase size={16} className="mr-3 text-gray-400" />
                    <span>{user.occupation}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {/* Example activities */}
                {[
                  { action: 'published a new post', target: 'Getting Started with React', time: '2 hours ago' },
                  { action: 'liked a post', target: 'TypeScript Tips', time: '1 day ago' },
                  { action: 'commented on', target: 'Building REST APIs', time: '3 days ago' },
                  { action: 'followed', target: 'Jane Smith', time: '1 week ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div className="flex-grow">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">You</span> {activity.action}{' '}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Posts
                </h3>
                <Link
                  to="/create"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>New Post</span>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <PostList
                  posts={userPosts}
                  isLoading={false}
                  error={null}
                  onPostUpdate={(updatedPost) => {
                    setUserPosts(prev => prev.map(post => 
                      post.id === updatedPost.id ? updatedPost : post
                    ));
                  }}
                />
              )}
              
              {userPosts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No posts yet
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start sharing your thoughts with the community
                  </p>
                  <Link to="/create" className="btn btn-primary">
                    Write Your First Post
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="text-center py-12">
              <Bookmark size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your favorite posts
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Posts you've bookmarked will appear here
              </p>
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Posts you've liked
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Posts you've liked will appear here
              </p>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your comments
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Comments you've made will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;