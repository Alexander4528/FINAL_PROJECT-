
const express = require('express');
const cors = require('cors');

const path = require('path');
const express = require('express');
const app = express();

// Настройка CORS
app.use(cors());

// Парсинг JSON
app.use(express.json());

// Логирование запросов
// В начале server.js, до всех маршрутов
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
app.get('/api/posts/search', (req, res) => {
  const { q, tag, author } = req.query;
  console.log('🔍 GET /api/posts/search - запрос:', { q, tag, author });
  
  const mockPosts = [
    { id: 1, title: 'Пост про React', content: 'React это библиотека...', tags: ['react', 'frontend'], author: 'Иван' },
    { id: 2, title: 'Node.js руководство', content: 'Node.js для начинающих...', tags: ['node', 'backend'], author: 'Мария' },
    { id: 3, title: 'JavaScript советы', content: 'Полезные советы по JS...', tags: ['javascript'], author: 'Алексей' }
  ];
  
  
  let filteredPosts = mockPosts;
  
  if (q) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(q.toLowerCase()) ||
      post.content.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  if (tag) {
    filteredPosts = filteredPosts.filter(post => 
      post.tags.includes(tag.toLowerCase())
    );
  }
  
  if (author) {
    filteredPosts = filteredPosts.filter(post => 
      post.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    query: { q, tag, author },
    results: filteredPosts,
    total: filteredPosts.length
  });
});

// 📌 ИЗБРАННОЕ
app.get('/api/favorites', (req, res) => {
  console.log('⭐ GET /api/favorites - запрос получен');
  
  res.json({
    success: true,
    favorites: [
      { id: 1, postId: 1, userId: 1, addedAt: '2024-02-15' },
      { id: 2, postId: 3, userId: 1, addedAt: '2024-02-16' }
    ]
  });
});

app.post('/api/favorites', (req, res) => {
  const { postId } = req.body;
  console.log('⭐ POST /api/favorites - добавление:', postId);
  
  res.json({
    success: true,
    message: 'Добавлено в избранное',
    favorite: {
      id: Date.now(),
      postId,
      userId: 1,
      addedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/favorites/:id', (req, res) => {
  const favoriteId = req.params.id;
  console.log(`⭐ DELETE /api/favorites/${favoriteId} - удаление`);
  
  res.json({
    success: true,
    message: 'Удалено из избранного'
  });
});

// 📌 ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЯ
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  console.log(`👤 GET /api/users/${userId} - запрос`);
  
  const users = {
    1: { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', role: 'author', bio: 'Frontend разработчик' },
    2: { id: 2, name: 'Мария Петрова', email: 'maria@example.com', role: 'admin', bio: 'Fullstack разработчик' },
    3: { id: 3, name: 'Алексей Сидоров', email: 'alex@example.com', role: 'user', bio: 'Блогер' }
  };
  
  const user = users[userId] || users[1];
  
  res.json({
    success: true,
    user: user
  });
});

// 📌 ОБНОВЛЕНИЕ ПРОФИЛЯ
app.put('/api/profile/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  console.log(`✏️ PUT /api/profile/${userId} - обновление:`, req.body);
  
  res.json({
    success: true,
    message: 'Профиль обновлен',
    user: {
      id: userId,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

// 📌 КОММЕНТАРИИ
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`💬 GET /api/posts/${postId}/comments`);
  
  const comments = [
    { id: 1, postId: postId, author: 'Мария', text: 'Отличная статья!', date: '2024-02-15' },
    { id: 2, postId: postId, author: 'Алексей', text: 'Спасибо за полезную информацию', date: '2024-02-16' }
  ];
  
  res.json({
    success: true,
    comments: comments
  });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`💬 POST /api/posts/${postId}/comments:`, req.body);
  
  res.status(201).json({
    success: true,
    comment: {
      id: Date.now(),
      postId: postId,
      author: 'Текущий пользователь',
      text: req.body.text,
      date: new Date().toISOString()
    }
  });
});
// ========== МАРШРУТЫ ==========

// Главная
app.get('/', (req, res) => {
  res.json({
    message: 'Бэкенд работает!',
    endpoints: [
      'GET  /api/users',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Пользователи
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Админ', email: 'admin@test.com', role: 'admin' },
      { id: 2, name: 'Пользователь', email: 'user@test.com', role: 'user' }
    ]
  });
});

// Логин
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Логин запрос:', { email, password });
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  
  // Простая проверка
  if (email === 'test@test.com' && password === '123456') {
    res.json({
      success: true,
      token: 'jwt-token-123',
      user: {
        id: 1,
        name: 'Тестовый пользователь',
        email: email,
        role: 'user'
      }
    });
  } else {
    res.status(401).json({ error: 'Неверные учетные данные' });
  }
});

// РЕГИСТРАЦИЯ - ВАЖНО!
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('Регистрация запрос:', { name, email, password });
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  
  // Всегда успешная регистрация для демо
  res.status(201).json({
    success: true,
    message: 'Пользователь успешно зарегистрирован',
    token: 'jwt-register-token-123',
    user: {
      id: Date.now(),
      name,
      email,
      role: 'user'
    }
  });
});
// 📌 ПОЛУЧЕНИЕ ВСЕХ ПОСТОВ (с пагинацией)
app.get('/api/posts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  console.log(`📝 GET /api/posts - page: ${page}, limit: ${limit}`);
  
  // Мок данные для постов
  const allPosts = [
    {
      id: 1,
      title: 'Мой первый пост в блоге',
      content: 'Это содержание первого поста. Здесь будет интересный текст о технологиях и разработке.',
      excerpt: 'Знакомство с блог-платформой и первые впечатления',
      author: 'Иван Иванов',
      authorId: 1,
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      likes: 42,
      commentsCount: 5,
      tags: ['технологии', 'программирование', 'блог'],
      imageUrl: null
    },
    {
      id: 2,
      title: 'Путешествие в Карпаты',
      content: 'Невероятные виды и приключения в горах. Советы для начинающих туристов.',
      excerpt: 'Личный опыт путешествия в Карпаты и полезные советы',
      author: 'Мария Петрова',
      authorId: 2,
      createdAt: '2024-02-05T14:20:00Z',
      updatedAt: '2024-02-05T14:20:00Z',
      likes: 87,
      commentsCount: 12,
      tags: ['путешествия', 'природа', 'отдых'],
      imageUrl: null
    },
    {
      id: 3,
      title: 'Рецепт идеального кофе',
      content: 'Как приготовить вкусный кофе дома. Выбор зерен, помол и методы заваривания.',
      excerpt: 'Подробное руководство по приготовлению вкусного кофе',
      author: 'Алексей Сидоров',
      authorId: 3,
      createdAt: '2024-02-10T09:15:00Z',
      updatedAt: '2024-02-10T09:15:00Z',
      likes: 31,
      commentsCount: 8,
      tags: ['кофе', 'рецепты', 'уют'],
      imageUrl: null
    },
    {
      id: 4,
      title: 'Изучение React в 2024 году',
      content: 'Современные подходы к изучению React. Хуки, контекст, серверные компоненты.',
      excerpt: 'Актуальные методы изучения React для начинающих',
      author: 'Иван Иванов',
      authorId: 1,
      createdAt: '2024-02-12T11:45:00Z',
      updatedAt: '2024-02-12T11:45:00Z',
      likes: 56,
      commentsCount: 7,
      tags: ['react', 'javascript', 'frontend', 'обучение'],
      imageUrl: null
    },
    {
      id: 5,
      title: 'Советы по продуктивности',
      content: 'Как организовать свой рабочий день, чтобы успевать больше.',
      excerpt: 'Практические советы по повышению продуктивности',
      author: 'Мария Петрова',
      authorId: 2,
      createdAt: '2024-02-14T16:30:00Z',
      updatedAt: '2024-02-14T16:30:00Z',
      likes: 29,
      commentsCount: 3,
      tags: ['продуктивность', 'работа', 'советы'],
      imageUrl: null
    }
  ];

  // Пагинация
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    posts: paginatedPosts,
    pagination: {
      page,
      limit,
      total: allPosts.length,
      pages: Math.ceil(allPosts.length / limit),
      hasNext: endIndex < allPosts.length,
      hasPrev: page > 1
    }
  });
});

// 📌 ПОЛУЧЕНИЕ ОДНОГО ПОСТА ПО ID
app.get('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`📝 GET /api/posts/${postId}`);
  
  const post = {
    id: postId,
    title: `Пост номер ${postId}`,
    content: `# Это заголовок поста ${postId}

Это содержание поста номер ${postId}. Здесь может быть **маркдаун** текст с форматированием.

## Подзаголовок

- Пункт 1
- Пункт 2
- Пункт 3

\`\`\`javascript
// Пример кода
const greeting = "Привет, мир!";
console.log(greeting);
\`\`\`

> Цитата: Это важная мысль из поста.

**Жирный текст** и *курсив* тоже поддерживаются.`,
    excerpt: `Краткое описание поста ${postId} для превью`,
    author: 'Автор поста',
    authorId: 1,
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-02-15T08:00:00Z',
    likes: Math.floor(Math.random() * 100),
    commentsCount: Math.floor(Math.random() * 20),
    tags: ['тег1', 'тег2', 'тег3'],
    imageUrl: null,
    comments: [
      {
        id: 1,
        author: 'Комментатор 1',
        authorId: 2,
        text: 'Отличный пост! Очень полезная информация.',
        createdAt: '2024-02-15T10:30:00Z',
        likes: 5
      },
      {
        id: 2,
        author: 'Комментатор 2',
        authorId: 3,
        text: 'Спасибо за подробное объяснение.',
        createdAt: '2024-02-15T14:20:00Z',
        likes: 3
      }
    ]
  };
  
  res.json({
    success: true,
    post: post
  });
});

// 📌 СОЗДАНИЕ НОВОГО ПОСТА
app.post('/api/posts', (req, res) => {
  console.log('📝 POST /api/posts:', req.body);
  
  const { title, content, excerpt, tags, imageUrl } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Заголовок и содержание обязательны'
    });
  }
  
  const newPost = {
    id: Date.now(),
    title,
    content,
    excerpt: excerpt || content.substring(0, 150) + '...',
    author: 'Текущий пользователь',
    authorId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    commentsCount: 0,
    tags: tags || [],
    imageUrl: imageUrl || null
  };
  
  res.status(201).json({
    success: true,
    message: 'Пост создан успешно',
    post: newPost
  });
});

// 📌 ОБНОВЛЕНИЕ ПОСТА
app.put('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`📝 PUT /api/posts/${postId}:`, req.body);
  
  const { title, content, excerpt, tags, imageUrl } = req.body;
  
  const updatedPost = {
    id: postId,
    title: title || `Обновленный пост ${postId}`,
    content: content || 'Обновленное содержание...',
    excerpt: excerpt || 'Обновленное описание...',
    author: 'Автор',
    authorId: 1,
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: new Date().toISOString(),
    likes: 25,
    commentsCount: 10,
    tags: tags || ['обновленный'],
    imageUrl: imageUrl || null
  };
  
  res.json({
    success: true,
    message: 'Пост обновлен успешно',
    post: updatedPost
  });
});

// 📌 УДАЛЕНИЕ ПОСТА
app.delete('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`📝 DELETE /api/posts/${postId}`);
  
  res.json({
    success: true,
    message: 'Пост удален успешно'
  });
});

// 📌 ЛАЙК ПОСТА
app.post('/api/posts/:id/like', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`❤️ POST /api/posts/${postId}/like`);
  
  res.json({
    success: true,
    message: 'Лайк добавлен',
    likes: Math.floor(Math.random() * 100) + 1
  });
});

// 📌 ДОБАВЛЕНИЕ В ИЗБРАННОЕ
app.post('/api/posts/:id/favorite', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`⭐ POST /api/posts/${postId}/favorite`);
  
  res.json({
    success: true,
    message: 'Добавлено в избранное'
  });
});
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
// server.js (Node.js/Express)
const express = require('express');

// Добавьте этот маршрут:
app.get('/api/posts', (req, res) => {
  res.json([
    { id: 1, title: 'Пост 1', createdAt: new Date() },
    { id: 2, title: 'Пост 2', createdAt: new Date() }
  ]);
});

// Запуск сервера
const PORT = 5000;
app.listen(PORT, () => {
  console.log('Server running on port 5000');
  console.log('='.repeat(50));
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('📡 Доступные маршруты:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/users`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log('='.repeat(50));
});