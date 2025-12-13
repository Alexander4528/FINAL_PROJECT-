const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // или порт вашего фронтенда
  credentials: true
}));

const express = require('express');
const app = express();

// Middleware для парсинга JSON
app.use(express.json());

// Временные данные для тестирования
let users = [
  { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
  { id: 2, name: 'Петр Петров', email: 'petr@example.com' }
];

// Маршрут для получения всех пользователей
app.get('/api/users', (req, res) => {
  console.log('GET /api/users запрос получен');
  res.json({
    success: true,
    message: 'Пользователи получены',
    users: users,
    count: users.length
  });
});

// Маршрут для получения одного пользователя по ID
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (user) {
    res.json({
      success: true,
      user: user
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Пользователь не найден'
    });
  }
});

// Маршрут для создания пользователя
app.post('/api/users', (req, res) => {
  console.log('POST /api/users запрос получен:', req.body);
  const newUser = {
    id: users.length + 1,
    ...req.body
  };
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'Пользователь создан',
    user: newUser
  });
});

// Маршрут для авторизации (login)
app.post('/api/auth/login', (req, res) => {
  console.log('POST /api/auth/login запрос получен:', req.body);
  const { email, password } = req.body;
  
  // Временная проверка (замените на реальную логику)
  if (email && password) {
    res.json({
      success: true,
      message: 'Авторизация успешна',
      token: 'temp-jwt-token-12345',
      user: {
        id: 1,
        name: 'Тестовый пользователь',
        email: email
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Неверные данные для входа'
    });
  }
});

// Маршрут для регистрации
app.post('/api/auth/register', (req, res) => {
  console.log('POST /api/auth/register запрос получен:', req.body);
  const { name, email, password } = req.body;
  
  if (name && email && password) {
    const newUser = {
      id: users.length + 1,
      name,
      email
    };
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      user: newUser,
      token: 'temp-jwt-token-' + Date.now()
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Все поля обязательны'
    });
  }
});

// Health check маршрут
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'backend-api'
  });
});

// Обработка 404 для API маршрутов
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`,
    availableRoutes: [
      'GET /api/users',
      'GET /api/users/:id',
      'POST /api/users',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/health'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`📡 Доступные маршруты:`);
  console.log(`   http://localhost:${PORT}/api/users`);
  console.log(`   http://localhost:${PORT}/api/auth/login`);
  console.log(`   http://localhost:${PORT}/api/health`);
});