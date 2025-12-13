import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import React from 'react';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email, password) => {
  try {
    // ВРЕМЕННЫЙ ФИКС: закомментируй реальный запрос
    // const response = await api.post('/auth/login', { email, password });
    // const { token, user } = response.data;
    
    // МОК-ОТВЕТ:
    console.log('Мок вход:', { email });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = {
      id: 1,
      email,
      username: email.split('@')[0],
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
      bio: 'Тестовый пользователь'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    set({ 
      user: mockUser, 
      token: mockToken, 
      isAuthenticated: true,
      isLoading: false 
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
    
    return { success: true, user: mockUser };
    
  } catch (error) {
    set({ isLoading: false });
    
    // Даже при ошибке возвращаем мок пользователя
    const mockUser = {
      id: Date.now(),
      email,
      username: email.split('@')[0],
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
      bio: 'Новый пользователь'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    set({ 
      user: mockUser, 
      token: mockToken, 
      isAuthenticated: true,
      isLoading: false 
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
    
    return { success: true, user: mockUser };
  }
},
      
      register: async (email, username, password) => {
  try {
    // ВРЕМЕННЫЙ ФИКС: закомментируй реальный запрос
    // const response = await api.post('/auth/register', { 
    //   email, 
    //   username, 
    //   password,
    //   confirmPassword: password 
    // });
    
    // ВСТАВЬ ВМЕСТО ЭТОГО МОК-ОТВЕТ:
    console.log('Мок регистрация:', { email, username });
    
    // Имитация запроса
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = {
      id: Date.now(),
      email,
      username,
      name: username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      bio: '',
      createdAt: new Date().toISOString()
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    set({ 
      user: mockUser, 
      token: mockToken, 
      isAuthenticated: true,
      isLoading: false 
    });
    
    // Set auth header for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
    
    return { success: true, user: mockUser };
    
  } catch (error) {
    set({ isLoading: false });
    
    // В случае ошибки тоже возвращаем успех для тестирования
    console.log('Регистрация (мок при ошибке):', { email, username });
    
    const mockUser = {
      id: Date.now(),
      email,
      username,
      name: username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      bio: '',
      createdAt: new Date().toISOString()
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    set({ 
      user: mockUser, 
      token: mockToken, 
      isAuthenticated: true,
      isLoading: false 
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
    
    return { success: true, user: mockUser };
  }
},
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('auth-storage');
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      },
      
      checkAuth: async () => {
  const { token } = get();
  
  if (!token) {
    set({ isLoading: false });
    return false;
  }
  
  try {
    // ВРЕМЕННО: пропускаем проверку токена
    // const response = await api.get('/auth/me');
    
    // Просто проверяем есть ли токен в localStorage
    const storedData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    
    if (storedData.state?.token && storedData.state?.user) {
      set({
        user: storedData.state.user,
        token: storedData.state.token,
        isAuthenticated: true,
        isLoading: false
      });
      
      api.defaults.headers.common['Authorization'] = `Bearer ${storedData.state.token}`;
      return true;
    }
    
    // Если нет данных, сбрасываем
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    delete api.defaults.headers.common['Authorization'];
    return false;
    
  } catch (error) {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    delete api.defaults.headers.common['Authorization'];
    return false;
  }
},
      
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
        state?.setLoading(false);
      }
    }
  )
);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const { checkAuth, isLoading } = useAuthStore();
  
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return children;
};