const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Admin = require('../../app/models/Admin');

let adminToken;
let adminId;

// Cleanup is now handled by the global setup in jest.setup.js
// No need for manual connection closing

// Admin authentication tests
describe('Admin Authentication', () => {
  describe('POST /api/admin/register', () => {
    it('should register a new admin account', async () => {
      const res = await request(app)
        .post('/api/admin/register')
        .send({
          username: 'authtest',
          email: 'authtest@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      
      // Save token and admin ID for future tests
      adminToken = res.body.token;
      
      // Get admin ID from database
      const admin = await Admin.findOne({ username: 'authtest' });
      adminId = admin._id;
    });
    
    it('should prevent creating second admin account', async () => {
      const res = await request(app)
        .post('/api/admin/register')
        .send({
          username: 'secondadmin',
          email: 'second@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('Admin account already exists');
    });
  });
  
  describe('POST /api/admin/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'authtest',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      
      // Update token
      adminToken = res.body.token;
    });
    
    it('should reject login with invalid username', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'wronguser',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('Invalid credentials');
    });
    
    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'authtest',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('Invalid credentials');
    });
  });
  
  describe('GET /api/admin/me', () => {
    it('should get admin profile with valid token', async () => {
      const res = await request(app)
        .get('/api/admin/me')
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('username', 'authtest');
      expect(res.body).toHaveProperty('email', 'authtest@example.com');
      expect(res.body).not.toHaveProperty('password'); // Password should not be returned
    });
    
    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/admin/me');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.msg).toEqual('No token, authorization denied');
    });
    
    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/me')
        .set('x-auth-token', 'invalidtoken');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.msg).toEqual('Token is not valid');
    });
  });
  
  describe('PUT /api/admin/password', () => {
    it('should change password with valid credentials', async () => {
      const res = await request(app)
        .put('/api/admin/password')
        .set('x-auth-token', adminToken)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toEqual('Password updated successfully');
      
      // Verify we can login with new password
      const loginRes = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'authtest',
          password: 'newpassword123'
        });
      
      expect(loginRes.statusCode).toEqual(200);
      expect(loginRes.body).toHaveProperty('token');
      
      // Save new token for next test
      adminToken = loginRes.body.token;
    });
    
    it('should reject password change with incorrect current password', async () => {
      const res = await request(app)
        .put('/api/admin/password')
        .set('x-auth-token', adminToken)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'anotherpassword'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('Current password is incorrect');
    });
  });
}); 