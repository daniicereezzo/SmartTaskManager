const request = require('supertest');

// Mock middleware and services
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => next(),
  verifyGoogleToken: (req, res, next) => {
    // provide a fake googleUser for the route
    req.googleUser = {
      googleId: 'g-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'http://example.com/p.jpg'
    };
    next();
  },
  requireGoogleCalendar: (req, res, next) => next(),
  generateToken: (userId) => `token-${userId}`
}));

// Mock User model and GoogleCalendarService
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(({ where }) => Promise.resolve(null)),
    create: jest.fn((data) => Promise.resolve({ id: 42, ...data })),
  }
}));

jest.mock('../services/GoogleCalendarService', () => ({
  getAuthUrl: jest.fn(() => 'https://auth.url'),
  getTokensFromCode: jest.fn(() => Promise.resolve({ access_token: 'a', refresh_token: 'r' }))
}));

const { app } = require('../server');

describe('Auth routes', () => {
  test('POST /api/auth/google creates user and returns token', async () => {
    const res = await request(app).post('/api/auth/google').send({ googleToken: 'ok' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('GET /api/auth/google/url returns auth URL', async () => {
    const res = await request(app).get('/api/auth/google/url');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('authUrl');
  });

  test('POST /api/auth/google/callback returns tokens', async () => {
    const res = await request(app).post('/api/auth/google/callback').send({ code: 'abc' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tokens');
  });
});
