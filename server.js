// server.js - МИНИМАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ
const express = require('express');
const app = express();

// ВАЖНО: Этот middleware должен быть ПЕРВЫМ
app.use((req, res, next) => {
  // Разрешаем запросы с фронтенда (localhost:3000)
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Обрабатываем предварительные OPTIONS запросы
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

// Простой тестовый маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'Бэкенд работает!',
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:5000'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Алексей', email: 'alex@test.ru' },
      { id: 2, name: 'Мария', email: 'maria@test.ru' }
    ]
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Получены данные для входа:', req.body);
  res.json({
    success: true,
    token: 'test-jwt-token',
    user: { id: 1, name: 'Тестовый пользователь' }
  });
});

// Запуск сервера
const PORT = 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('✅ БЭКЕНД ЗАПУЩЕН НА ПОРТУ 5000');
  console.log('='.repeat(50));
  console.log('🌐 Фронтенд (React): http://localhost:3000');
  console.log('⚙️  Бэкенд (Node.js): http://localhost:5000');
  console.log('='.repeat(50));
  console.log('📡 Тестируйте в браузере:');
  console.log('   http://localhost:5000');
  console.log('   http://localhost:5000/api/health');
  console.log('   http://localhost:5000/api/users');
  console.log('='.repeat(50));
});