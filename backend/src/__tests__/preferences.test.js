const request = require('supertest');

// Mock auth middleware to inject req.user and provide other helpers
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = {
      id: 1,
      themePreference: 'light',
      update: jest.fn(function (data) { Object.assign(this, data); return Promise.resolve(this); })
    };
    next();
  },
  verifyGoogleToken: (req, res, next) => next(),
  requireGoogleCalendar: (req, res, next) => next(),
  generateToken: () => 'token'
}));

// Mock preference models
jest.mock('../models', () => ({
  UserDailyPreference: {
    findAll: jest.fn(() => Promise.resolve([{ userId: 1, dayOfWeek: 0 }])),
    upsert: jest.fn((data) => Promise.resolve([data, true]))
  },
  UserEnergyPattern: {
    findAll: jest.fn(() => Promise.resolve([])),
    destroy: jest.fn(() => Promise.resolve()),
    create: jest.fn((p) => Promise.resolve(p)),
    bulkCreate: jest.fn((arr) => Promise.resolve(arr))
  }
}));

const { app } = require('../server');

describe('Preferences routes', () => {
  test('GET /api/preferences/daily returns preferences', async () => {
    const res = await request(app).get('/api/preferences/daily');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('PUT /api/preferences/daily validates input', async () => {
    const bad = await request(app).put('/api/preferences/daily').send({ preferences: {} });
    expect(bad.statusCode).toBe(400);

    const ok = await request(app).put('/api/preferences/daily').send({ preferences: [{ dayOfWeek: 1, availableStartTime: '08:00', availableEndTime: '17:00' }] });
    expect(ok.statusCode).toBe(200);
    expect(ok.body).toHaveProperty('success', true);
  });

  test('GET /api/preferences/energy and PUT /api/preferences/energy', async () => {
    const get = await request(app).get('/api/preferences/energy');
    expect(get.statusCode).toBe(200);

    const put = await request(app).put('/api/preferences/energy').send({ patterns: [{ dayOfWeek: 1, timeSlotStart: '08:00', timeSlotEnd: '12:00', energyLevel: 'high' }] });
    expect(put.statusCode).toBe(200);
  });

  test('POST /api/preferences/energy/default creates defaults', async () => {
    const res = await request(app).post('/api/preferences/energy/default');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('GET and PUT /api/preferences/theme', async () => {
    const get = await request(app).get('/api/preferences/theme');
    expect(get.statusCode).toBe(200);
    expect(get.body.data.themePreference).toBeDefined();

    const bad = await request(app).put('/api/preferences/theme').send({ themePreference: 'blue' });
    expect(bad.statusCode).toBe(400);

    const ok = await request(app).put('/api/preferences/theme').send({ themePreference: 'dark' });
    expect(ok.statusCode).toBe(200);
    expect(ok.body.data.themePreference).toBe('dark');
  });
});
