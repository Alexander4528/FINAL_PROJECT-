import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  Calendar, 
  FileText, 
  Users, 
  Mail, 
  MapPin, 
  Globe, 
  Briefcase, 
  Heart,
  Bookmark,
  MessageCircle,
  Plus,
  Check,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUser, getUserPosts, followUser } from '../services/api';
import PostList from '../components/PostList';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const UserPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async (page = 1) => {
    setIsLoading(true);
    try {
      // Fetch user info
      const userResponse = await getUser(id);
      setUser(userResponse.data.user);
      
      // Fetch user posts
      const postsResponse = await getUserPosts(id, { page, limit: pagination.limit });
      setUserPosts(postsResponse.data.posts);
      setPagination(postsResponse.data.pagination);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }
    
    try {
      const response = await followUser(id);
      setUser(prev => ({
        ...prev,
        isFollowing: response.data.following,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (response.data.following ? 1 : -1)
        }
      }));
      toast.success(response.data.following ? 'Followed user!' : 'Unfollowed user');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to follow user');
    }
  };

  const handlePageChange = (newPage) => {
    fetchUserData(newPage);
  };

  const isOwnProfile = currentUser && currentUser.id === id;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">😕</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          User not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The user you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'posts', label: 'Posts', icon: <FileText size={18} />, count: pagination.total },
    { id: 'about', label: 'About', icon: <User size={18} /> },
    { id: 'stats', label: 'Stats', icon: <Users size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
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
                  {!isOwnProfile && currentUser && (
                    <button
                      onClick={handleFollow}
                      className={`btn flex items-center space-x-2 ${
                        user.isFollowing ? 'btn-secondary' : 'btn-primary'
                      }`}
                    >
                      {user.isFollowing ? (
                        <>
                          <Check size={16} />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {isOwnProfile && (
                    <Link
                      to="/profile/edit"
                      className="btn btn-outline flex items-center space-x-2"
                    >
                      <span>Edit Profile</span>
                    </Link>
                  )}
                  
                  <button className="btn btn-outline flex items-center space-x-2">
                    <MessageCircle size={16} />
                    <span>Message</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Posts', value: pagination.total, icon: <FileText size={20} /> },
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
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* About Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h3>
            
            <div className="space-y-4">
              {user.email && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin size={16} className="mr-3 text-gray-400" />
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <div className="flex items-center">
                  <Globe size={16} className="mr-3 text-gray-400" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 truncate"
                  >
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
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar size={16} className="mr-3 text-gray-400" />
                <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'React', 'Node.js', 'TypeScript', 'Web Development'].map((tag) => (
                <Link
                  key={tag}
                  to={`/search?tag=${tag}`}
                  className="tag text-sm"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
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
                    {tab.count && (
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
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {userPosts.length === 0 ? 'No posts yet' : 'Recent Posts'}
                    </h3>
                    {userPosts.length > 0 && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {pagination.total} posts in total
                      </p>
                    )}
                  </div>
                  
                  {userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No posts yet
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        {user.username} hasn't published any posts yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <PostList
                        posts={userPosts}
                        isLoading={false}
                        error={null}
                      />
                      
                      {/* Pagination for posts */}
                      {pagination.pages > 1 && (
                        <div className="mt-8 flex justify-center">
                          <nav className="flex items-center space-x-2">
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded ${
                                  pagination.page === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Bio
                    </h4>
                    {user.bio ? (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {user.bio}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No bio provided
                      </p>
                    )}
                  </div>

                  {user.interests && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.split(',').map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm"
                          >
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.skills && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.split(',').map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Views', value: '12.4K', icon: '👁️', color: 'blue' },
                    { label: 'Avg. Read Time', value: '3.2 min', icon: '⏱️', color: 'green' },
                    { label: 'Post Likes', value: '1.2K', icon: '❤️', color: 'red' },
                    { label: 'Comments', value: '456', icon: '💬', color: 'purple' },
                    { label: 'Shares', value: '234', icon: '🔗', color: 'yellow' },
                    { label: 'Favorites', value: '123', icon: '⭐', color: 'orange' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center"
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;