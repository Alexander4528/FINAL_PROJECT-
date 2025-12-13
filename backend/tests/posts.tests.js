const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const bcrypt = require('bcryptjs');

describe('Posts API', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeAll(async () => {
    // Clean up database
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Create regular user
    const userPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'testuser',
        password: userPassword
      }
    });
    userId = user.id;

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN'
      }
    });
    adminId = admin.id;

    // Login as regular user
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });
    userToken = userRes.body.token;

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/posts', () => {
    it('should create a post successfully', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post content.',
          excerpt: 'Test excerpt',
          tags: ['test', 'javascript']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.post.title).toBe('Test Post');
      expect(res.body.post.tags).toHaveLength(2);
    });

    it('should not create post without authentication', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          content: 'This is a test post content.'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not create post with invalid data', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'AB',
          content: 'Short'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/posts', () => {
    beforeAll(async () => {
      // Create some test posts
      await prisma.post.createMany({
        data: [
          {
            title: 'First Post',
            content: 'Content of first post',
            authorId: userId,
            excerpt: 'First excerpt'
          },
          {
            title: 'Second Post',
            content: 'Content of second post',
            authorId: userId,
            excerpt: 'Second excerpt'
          },
          {
            title: 'JavaScript Tutorial',
            content: 'Learn JavaScript programming',
            authorId: adminId,
            excerpt: 'JS tutorial'
          }
        ]
      });
    });

    it('should get all posts', async () => {
      const res = await request(app)
        .get('/api/posts');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.posts).toBeInstanceOf(Array);
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('should search posts by title', async () => {
      const res = await request(app)
        .get('/api/posts')
        .query({ search: 'JavaScript' });

      expect(res.statusCode).toBe(200);
      expect(res.body.posts.length).toBeGreaterThan(0);
      expect(res.body.posts[0].title).toContain('JavaScript');
    });

    it('should paginate posts', async () => {
      const res = await request(app)
        .get('/api/posts')
        .query({ page: 1, limit: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.posts.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.page).toBe(1);
    });
  });

  describe('GET /api/posts/:id', () => {
    let postId;

    beforeAll(async () => {
      // Create a post to get
      const post = await prisma.post.create({
        data: {
          title: 'Single Post',
          content: 'Content of single post',
          authorId: userId
        }
      });
      postId = post.id;
    });

    it('should get a single post by id', async () => {
      const res = await request(app)
        .get(`/api/posts/${postId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.post.id).toBe(postId);
      expect(res.body.post.title).toBe('Single Post');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .get('/api/posts/non-existent-id');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id', () => {
    let postId;

    beforeEach(async () => {
      // Create a post to update
      const post = await prisma.post.create({
        data: {
          title: 'Post to Update',
          content: 'Original content',
          authorId: userId
        }
      });
      postId = post.id;
    });

    it('should update post by author', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.post.title).toBe('Updated Title');
    });

    it('should update post by admin', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated',
          content: 'Updated by admin'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not update post by non-author non-admin', async () => {
      // Create another user
      const anotherPassword = await bcrypt.hash('password123', 10);
      const anotherUser = await prisma.user.create({
        data: {
          email: 'another@example.com',
          username: 'anotheruser',
          password: anotherPassword
        }
      });

      // Login as another user
      const anotherRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'another@example.com',
          password: 'password123'
        });
      const anotherToken = anotherRes.body.token;

      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          title: 'Unauthorized Update',
          content: 'Should not work'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    let postId;

    beforeAll(async () => {
      // Create a post to like
      const post = await prisma.post.create({
        data: {
          title: 'Post to Like',
          content: 'Like this post',
          authorId: userId
        }
      });
      postId = post.id;
    });

    it('should like a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.liked).toBe(true);
    });

    it('should unlike a post', async () => {
      // First like
      await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${userToken}`);

      // Then unlike
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.liked).toBe(false);
    });
  });
});