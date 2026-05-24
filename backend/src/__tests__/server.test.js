const request = require('supertest');
const { app } = require('../server');

describe('Backend server', () => {
  test('GET /health returns status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  }, 10000);
});
