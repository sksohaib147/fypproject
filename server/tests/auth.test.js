const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Flow', () => {
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    address: '123 Main St'
  };

  describe('Signup Process', () => {
    it('should successfully create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not create user with existing email', async () => {
      await User.create(testUser);

      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'An account with this email already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide all required fields');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...testUser,
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide a valid email address');
    });

    it('should validate password length', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...testUser,
          password: '12345'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Login Process', () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it('should successfully login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should not login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide email and password');
    });
  });

  describe('Get Current User', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create(testUser);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      token = loginRes.body.token;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', testUser.email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not get current user without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'No token provided');
    });

    it('should not get current user with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid token');
    });
  });
}); 