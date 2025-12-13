import { HashRouter as Router, Routes, Route, Link, Navigate} from 'react-router-dom';
import React from 'react';

// Импортируем ВАШИ страницы
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import UserPage from './pages/UserPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import EditProfilePage from './pages/EditProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import NotFoundPage from './pages/NotFoundPage';

// Компонент навигации
function Navigation() {
  // Проверяем, авторизован ли пользователь
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      padding: '15px 0',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Логотип и основные ссылки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <Link 
            to="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '22px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '28px' }}>📝</span>
            <span>БлогПлатформа</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link 
              to="/" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span>🏠</span>
              <span>Главная</span>
            </Link>
            
            <Link 
              to="/search" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span>🔍</span>
              <span>Поиск</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/create-post" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span>✏️</span>
                  <span>Создать пост</span>
                </Link>
                
                <Link 
                  to="/favorites" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span>⭐</span>
                  <span>Избранное</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Правая часть - авторизация/профиль */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isAuthenticated ? (
            <>
              <Link 
                to={`/user/${user.id || 'me'}`}
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#3498db',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name || 'Пользователь'}</span>
              </Link>
              
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                style={{
                  padding: '8px 15px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  padding: '8px 15px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                🔐 Войти
              </Link>
              
              <Link 
                to="/register" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  padding: '8px 15px',
                  backgroundColor: '#3498db',
                  borderRadius: '4px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
              >
                📝 Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Главный компонент приложения
function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Navigation />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
          <Routes>
            {/* Основные маршруты */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            
            {/* Динамические маршруты с параметрами */}
            <Route path="/posts/:id" element={<PostPage />} />
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            
            {/* Реддиректы */}
            <Route path="/home" element={<Navigate to="/" />} />
            <Route path="/auth/login" element={<Navigate to="/login" />} />
            <Route path="/auth/register" element={<Navigate to="/register" />} />
            
            {/* Страница 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        
        {/* Футер */}
        <footer style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '30px 20px',
          marginTop: '50px',
          borderTop: '1px solid #34495e'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '40px',
              marginBottom: '30px'
            }}>
              <div>
                <h3 style={{ color: '#ecf0f1', marginBottom: '15px' }}>БлогПлатформа</h3>
                <p style={{ color: '#bdc3c7', lineHeight: '1.6' }}>
                  Платформа для создания и обмена интересным контентом.
                  Присоединяйтесь к нашему сообществу!
                </p>
              </div>
              
              <div>
                <h4 style={{ color: '#ecf0f1', marginBottom: '15px' }}>Навигация</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Главная</Link>
                  <Link to="/search" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Поиск</Link>
                  <Link to="/create-post" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Создать пост</Link>
                </div>
              </div>
              
              <div>
                <h4 style={{ color: '#ecf0f1', marginBottom: '15px' }}>Аккаунт</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/login" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Войти</Link>
                  <Link to="/register" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Регистрация</Link>
                  <Link to="/profile" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Профиль</Link>
                </div>
              </div>
            </div>
            
            <div style={{ 
              borderTop: '1px solid #34495e', 
              paddingTop: '20px', 
              textAlign: 'center',
              color: '#95a5a6',
              fontSize: '14px'
            }}>
              <p>© 2024 БлогПлатформа. Все права защищены.</p>
              <p style={{ marginTop: '5px' }}>
                Разработано с ❤️ с использованием React и Node.js
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;