const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const bcrypt = require('bcryptjs');

describe('Users API', () => {
  let userToken;
  let userId;
  let otherUserId;

  beforeAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();

    // Create test user
    const userPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        username: 'testuser',
        password: userPassword
      }
    });
    userId = user.id;

    // Create another user
    const otherPassword = await bcrypt.hash('password123', 10);
    const otherUser = await prisma.user.create({
      data: {
        email: 'other@example.com',
        username: 'otheruser',
        password: otherPassword
      }
    });
    otherUserId = otherUser.id;

    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    userToken = res.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('should search users by username', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ search: 'testuser' });

      expect(res.statusCode).toBe(200);
      expect(res.body.users.length).toBeGreaterThan(0);
      expect(res.body.users[0].username).toBe('testuser');
    });

    it('should paginate users', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.users.length).toBeLessThanOrEqual(1);
      expect(res.body.pagination.page).toBe(1);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.id).toBe(userId);
      expect(res.body.user.username).toBe('testuser');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/non-existent-id');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should show isFollowing status when authenticated', async () => {
      const res = await request(app)
        .get(`/api/users/${otherUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('isFollowing');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: 'This is my bio',
          avatar: 'https://example.com/avatar.jpg'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.bio).toBe('This is my bio');
    });

    it('should not update other users profile', async () => {
      const res = await request(app)
        .put(`/api/users/${otherUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: 'Trying to update others bio'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should update password when current password is provided', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'newpassword123',
          currentPassword: 'password123'
        });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/users/:id/follow', () => {
    it('should follow a user', async () => {
      const res = await request(app)
        .post(`/api/users/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.following).toBe(true);
    });

    it('should unfollow a user', async () => {
      // First follow
      await request(app)
        .post(`/api/users/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${userToken}`);

      // Then unfollow
      const res = await request(app)
        .post(`/api/users/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.following).toBe(false);
    });

    it('should not follow yourself', async () => {
      const res = await request(app)
        .post(`/api/users/${userId}/follow`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
    });
  });
});