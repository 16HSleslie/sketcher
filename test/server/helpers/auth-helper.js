const request = require('supertest');
const Admin = require('../../../app/models/Admin');

/**
 * Helper to create admin and get authentication token
 * @param {object} app - Express app instance
 * @param {object} userData - Admin user data
 * @returns {Promise<string>} Authentication token
 */
async function getAdminToken(app, userData = null) {
  // Default admin data if none provided
  const adminData = userData || {
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: 'password123'
  };

  // Register admin user
  const response = await request(app)
    .post('/api/admin/register')
    .send(adminData);

  // Return token
  return response.body.token;
}

/**
 * Helper to create admin directly in database
 * @param {object} userData - Admin user data
 * @returns {Promise<object>} Created admin document
 */
async function createAdminDirectly(userData = null) {
  // Default admin data if none provided
  const adminData = userData || {
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: 'password123'
  };

  // Create admin directly in database
  const admin = new Admin(adminData);
  await admin.save();
  
  return admin;
}

module.exports = {
  getAdminToken,
  createAdminDirectly
}; 