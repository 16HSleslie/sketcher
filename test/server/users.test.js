const request = require('supertest');
const express = require('express');
const usersRouter = require('../../app/routes/users');

// Create a test app
const app = express();
app.use('/api/users', usersRouter);

describe('Users API Routes', () => {
  it('GET /api/users should return a success message', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Users API is working');
    expect(response.body.timestamp).toBeDefined();
  });
}); 