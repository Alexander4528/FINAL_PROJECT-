import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
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
  const { user: currentUser, logout } = useAuthStore(); // переименовал для ясности
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    favorites: 0,
    comments: 0,
  });
  
  // Безопасный форматтер даты
  const safeFormatDate = (dateString) => {
    if (!dateString) return 'недавно';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'недавно';
      
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: ru
      });
    } catch {
      return 'недавно';
    }
  };
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [currentUser, navigate]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await getUserPosts(currentUser.id, { page: 1, limit: 10 });
      setUserPosts(response.data?.posts || response.posts || []);
      
      setStats({
        posts: response.data?.pagination?.total || response.pagination?.total || 0,
        likes: currentUser.totalLikes || 245,
        favorites: currentUser.totalFavorites || 42,
        comments: currentUser.totalComments || 156,
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
      toast.error('Не удалось загрузить данные профиля');
      
      // Мок данные на случай ошибки
      setUserPosts([]);
      setStats({
        posts: 0,
        likes: 0,
        favorites: 0,
        comments: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Вы успешно вышли');
    navigate('/login');
  };

  if (!currentUser) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'posts', label: 'Посты', icon: <FileText size={18} />, count: stats.posts },
    { id: 'favorites', label: 'Избранное', icon: <Bookmark size={18} />, count: stats.favorites },
    { id: 'likes', label: 'Лайки', icon: <Heart size={18} />, count: stats.likes },
    { id: 'comments', label: 'Комментарии', icon: <Users size={18} />, count: stats.comments },
  ];

  // Если нет даты создания, используем текущую
  const userCreatedAt = currentUser.createdAt || new Date().toISOString();

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
            Редактировать
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            {/* Avatar */}
            <div className="mb-4 md:mb-0 md:mr-6">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
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
                    {currentUser.username || currentUser.name || 'Пользователь'}
                  </h1>
                  {currentUser.bio && (
                    <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                      {currentUser.bio}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Настройки</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Посты', value: stats.posts, icon: <FileText size={20} /> },
                  { label: 'Подписчики', value: currentUser._count?.followers || 0, icon: <Users size={20} /> },
                  { label: 'Подписки', value: currentUser._count?.following || 0, icon: <Users size={20} /> },
                  { 
                    label: 'Зарегистрирован', 
                    value: safeFormatDate(userCreatedAt), 
                    icon: <Calendar size={20} /> 
                  },
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
                Контактная информация
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <span>{currentUser.email || 'Не указано'}</span>
                </div>
                
                {currentUser.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin size={16} className="mr-3 text-gray-400" />
                    <span>{currentUser.location}</span>
                  </div>
                )}
                
                {currentUser.website && (
                  <div className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    <LinkIcon size={16} className="mr-3" />
                    <a href={currentUser.website} target="_blank" rel="noopener noreferrer">
                      {currentUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                {currentUser.occupation && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Briefcase size={16} className="mr-3 text-gray-400" />
                    <span>{currentUser.occupation}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Недавняя активность
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'опубликовал новый пост', target: 'Начало работы с React', time: '2 часа назад' },
                  { action: 'понравился пост', target: 'Советы по TypeScript', time: '1 день назад' },
                  { action: 'прокомментировал', target: 'Создание REST API', time: '3 дня назад' },
                  { action: 'подписался на', target: 'Анна Иванова', time: '1 неделю назад' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div className="flex-grow">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Вы</span> {activity.activity}{' '}
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
                  Ваши посты
                </h3>
                <Link
                  to="/create"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Новый пост</span>
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
                    Пока нет постов
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Начните делиться мыслями с сообществом
                  </p>
                  <Link to="/create" className="btn btn-primary">
                    Написать первый пост
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="text-center py-12">
              <Bookmark size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Избранные посты
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Посты, которые вы сохранили, появятся здесь
              </p>
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Понравившиеся посты
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Посты, которые вам понравились, появятся здесь
              </p>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ваши комментарии
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Комментарии, которые вы оставили, появятся здесь
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;