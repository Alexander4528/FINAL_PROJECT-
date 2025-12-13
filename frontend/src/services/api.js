import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен в запросы
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Основные функции API
// api.js - функция getPosts
export const getPosts = async (page = 1, limit = 10, sort = 'newest') => {
  try {
    // ВРЕМЕННО: возвращаем мок данные без запроса на сервер
    console.log('Запрос постов (мок)');
    
    // Проверяем есть ли посты в localStorage
    const savedPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
    
    // Мок посты по умолчанию
    const mockPosts = [
      {
        id: 1,
        title: 'Добро пожаловать в блог!',
        content: 'Это пример первого поста в нашем блоге.',
        excerpt: 'Знакомство с платформой',
        author: { id: 1, name: 'Администратор' },
        createdAt: '2024-01-15T10:30:00.000Z',
        likes: 42,
        tags: ['приветствие', 'блог'],
        comments: 5
      },
      {
        id: 2,
        title: 'Как создать свой первый пост',
        content: 'Просто нажмите кнопку "Создать пост" и заполните форму.',
        excerpt: 'Инструкция для новичков',
        author: { id: 2, name: 'Модератор' },
        createdAt: '2024-01-14T14:20:00.000Z',
        likes: 28,
        tags: ['инструкция', 'помощь'],
        comments: 3
      },
      {
        id: 3,
        title: 'Лучшие практики ведения блога',
        content: 'Регулярность, качественный контент и взаимодействие с аудиторией.',
        excerpt: 'Советы для блогеров',
        author: { id: 1, name: 'Администратор' },
        createdAt: '2024-01-13T09:15:00.000Z',
        likes: 56,
        tags: ['советы', 'блоггинг'],
        comments: 8
      }
    ];
    
    // Объединяем сохраненные и мок посты
    const allPosts = [...savedPosts, ...mockPosts];
    
    // Сортируем
    let sortedPosts = [...allPosts];
    if (sort === 'newest') {
      sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'popular') {
      sortedPosts.sort((a, b) => b.likes - a.likes);
    }
    
    // Пагинация
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = sortedPosts.slice(start, end);
    
    return {
      success: true,
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total: allPosts.length,
        pages: Math.ceil(allPosts.length / limit)
      }
    };
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Возвращаем мок данные даже при ошибке
    return {
      success: true,
      posts: [
        { 
          id: 1, 
          title: 'Пример поста', 
          content: 'Содержание...', 
          author: { name: 'Тестовый автор' },
          createdAt: new Date().toISOString(),
          likes: 10,
          tags: ['пример']
        }
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 }
    };
  }
};

export const getPost = async (id) => {
  try {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      success: true,
      post: {
        id,
        title: `Пост ${id}`,
        content: 'Содержание поста...',
        author: 'Автор',
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      }
    };
  }
};

export const createPost = async (postData) => {
  // ВРЕМЕННЫЙ ФИКС:
  console.log('Создание поста:', postData);
  
  // Возвращаем мок данные
  const mockResponse = {
    success: true,
    post: {
      id: Date.now(),
      ...postData,
      createdAt: new Date().toISOString(),
      author: { 
        id: 1, 
        name: localStorage.getItem('username') || 'Пользователь' 
      },
      likes: 0,
      comments: []
    }
  };
  
  console.log('Мок ответ:', mockResponse);
  return mockResponse;
  
  // Закомментируй старый код:
  // try {
  //   const response = await api.post('/posts', postData);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error creating post:', error);
  //   throw error;
  // }
};

export const updatePost = async (id, postData) => {
  try {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    return {
      success: true,
      message: 'Пост обновлен (мок)',
      post: { id, ...postData }
    };
  }
};

export const deletePost = async (id) => {
  try {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: true, message: 'Пост удален (мок)' };
  }
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
  try {
    // Временное решение - используем общий список
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    const posts = response.data.posts || [];
    // Фильтруем по userId (в реальном API будет параметр)
    const userPosts = posts.filter(post => post.authorId === userId || post.author?.includes('пользователь'));
    return {
      success: true,
      posts: userPosts.length > 0 ? userPosts : posts.slice(0, 3),
      total: userPosts.length || 3
    };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return {
      success: true,
      posts: [
        { id: 1, title: 'Пост пользователя 1', content: 'Содержание...', authorId: userId },
        { id: 2, title: 'Пост пользователя 2', content: 'Содержание...', authorId: userId }
      ],
      total: 2
    };
  }
};

// Аутентификация
// ВРЕМЕННЫЕ МОК-ФУНКЦИИ ДЛЯ АВТОРИЗАЦИИ
export const login = async (credentials) => {
  console.log('Логин:', credentials);
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockUser = {
    id: 1,
    email: credentials.email,
    name: credentials.email.split('@')[0],
    token: 'mock-jwt-token-' + Date.now()
  };
  
  // Сохраняем в localStorage
  localStorage.setItem('token', mockUser.token);
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  return {
    success: true,
    user: mockUser,
    token: mockUser.token
  };
};

export const register = async (userData) => {
  console.log('Регистрация:', userData);
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockUser = {
    id: Date.now(),
    ...userData,
    token: 'mock-jwt-token-' + Date.now()
  };
  
  // Сохраняем в localStorage
  localStorage.setItem('token', mockUser.token);
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  return {
    success: true,
    user: mockUser,
    token: mockUser.token,
    message: 'Регистрация успешна (мок)'
  };
};

// Пользователи
export const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: true,
      user: {
        id,
        name: 'Пользователь',
        email: 'user@example.com',
        bio: 'Информация о пользователе'
      }
    };
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/profile/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: true,
      message: 'Профиль обновлен (мок)',
      user: { id, ...userData }
    };
  }
};

// 🔥 ДОБАВЛЯЕМ НОВЫЕ ФУНКЦИИ, КОТОРЫХ НЕ ХВАТАЕТ:

// Лайки
export const likePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    return {
      success: true,
      message: 'Лайк добавлен (мок)',
      likes: Math.floor(Math.random() * 100)
    };
  }
};

// Избранное
export const favoritePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Error favoriting post:', error);
    return {
      success: true,
      message: 'Добавлено в избранное (мок)'
    };
  }
};

// Подписка на пользователя
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    return {
      success: true,
      message: 'Подписка оформлена (мок)'
    };
  }
};

// Комментарии
export const getComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return {
      success: true,
      comments: [
        { id: 1, text: 'Отличный пост!', author: 'Комментатор 1', date: '2024-02-15' },
        { id: 2, text: 'Спасибо за информацию', author: 'Комментатор 2', date: '2024-02-16' }
      ]
    };
  }
};

export const createComment = async (postId, commentData) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    return {
      success: true,
      comment: {
        id: Date.now(),
        postId,
        text: commentData.text,
        author: 'Вы',
        date: new Date().toISOString()
      }
    };
  }
};

export const updateComment = async (commentId, commentData) => {
  try {
    const response = await api.put(`/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    return {
      success: true,
      message: 'Комментарий обновлен (мок)',
      comment: { id: commentId, ...commentData }
    };
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: true, message: 'Комментарий удален (мок)' };
  }
};

// Поиск
export const searchPosts = async (query) => {
  try {
    const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    return {
      success: true,
      results: [
        { id: 1, title: `Результат по запросу "${query}"`, content: 'Содержание...' },
        { id: 2, title: 'Еще один результат', content: 'Содержание...' }
      ]
    };
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    return {
      success: true,
      users: [
        { id: 1, name: 'Пользователь 1' },
        { id: 2, name: 'Пользователь 2' }
      ]
    };
  }
};

// Экспорт для совместимости с существующим кодом
export const authAPI = { login, register };
export const postsAPI = { getPosts, getPost, createPost, updatePost, deletePost, likePost, favoritePost };
export const usersAPI = { getUser, updateUser, followUser };
export const commentsAPI = { getComments, createComment, updateComment, deleteComment };
export const searchAPI = { searchPosts, searchUsers };

// Получение текущего пользователя
export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default api;