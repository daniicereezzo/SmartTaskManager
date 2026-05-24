const request = require('supertest');

// Mock auth middleware to inject a test user and bypass Google calendar requirement
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, googleId: 'google-1' };
    return next();
  },
  requireGoogleCalendar: (req, res, next) => next(),
  generateToken: () => 'token',
  verifyGoogleToken: (req, res, next) => next()
}));

// Mock models
const mockTask = {
  id: 1,
  userId: 1,
  title: 'Test Task',
  taskType: 'mandatory',
  googleCalendarEventId: null,
  update: jest.fn(function (data) { Object.assign(this, data); return Promise.resolve(this); }),
  destroy: jest.fn(() => Promise.resolve())
};

const mockTasksCount = { rows: [mockTask], count: 1 };

jest.mock('../models', () => ({
  Task: {
    findAndCountAll: jest.fn(() => Promise.resolve(mockTasksCount)),
    findOne: jest.fn(({ where }) => {
      if (where && where.id && where.id.toString() === '1') return Promise.resolve(mockTask);
      return Promise.resolve(null);
    }),
    create: jest.fn((data) => Promise.resolve({ ...data, id: 2 })),
  },
  TaskCategory: {},
  ScheduledSlot: {
    findAll: jest.fn(() => Promise.resolve([]))
  }
}));

// Mock external services
jest.mock('../services/GoogleCalendarService', () => ({
  createCalendarEvent: jest.fn(() => Promise.resolve({ ok: true })),
  updateCalendarEvent: jest.fn(() => Promise.resolve({ ok: true })),
  deleteCalendarEvent: jest.fn(() => Promise.resolve({ ok: true })),
  syncTasksWithCalendar: jest.fn(() => Promise.resolve({ synced: 0 }))
}));

jest.mock('../services/SchedulingService', () => ({
  scheduleTasks: jest.fn(() => Promise.resolve({ scheduled: 0 }))
}));

const { app } = require('../server');

describe('Tasks routes', () => {
  test('GET /api/tasks returns paginated tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/tasks/:id returns task or 404', async () => {
    const ok = await request(app).get('/api/tasks/1');
    expect(ok.statusCode).toBe(200);
    expect(ok.body).toHaveProperty('success', true);

    const notFound = await request(app).get('/api/tasks/999');
    expect(notFound.statusCode).toBe(404);
  });

  test('POST /api/tasks creates task and triggers calendar sync', async () => {
    const payload = { title: 'New Task', taskType: 'mandatory' };
    const res = await request(app).post('/api/tasks').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('id');
  });

  test('PUT /api/tasks/:id updates task', async () => {
    const res = await request(app).put('/api/tasks/1').send({ title: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.title).toBe('Updated');
  });

  test('DELETE /api/tasks/:id deletes task', async () => {
    const res = await request(app).delete('/api/tasks/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('POST /api/tasks/schedule triggers scheduling service', async () => {
    const res = await request(app).post('/api/tasks/schedule').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('GET /api/tasks/scheduled/:date returns scheduled slots', async () => {
    const res = await request(app).get('/api/tasks/scheduled/2025-10-24');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('PUT /api/tasks/:id/status updates status', async () => {
    const res = await request(app).put('/api/tasks/1/status').send({ status: 'completed', completionPercentage: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('POST /api/tasks/sync-calendar triggers calendar sync', async () => {
    const res = await request(app).post('/api/tasks/sync-calendar');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
