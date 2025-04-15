const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the server setup (without actually starting the server)
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock API routes
app.use('/api/users', require('../../app/routes/users'));

// Mock static file serving
app.use(express.static(path.join(__dirname, '../../dist')));

describe('Server Routes', () => {
  it('should respond to /api/users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
}); 