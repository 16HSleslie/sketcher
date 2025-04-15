const { setupDatabase, teardownDatabase, clearDatabase } = require('./setup');
const mongoose = require('mongoose');

// Increase test timeout for slower operations
jest.setTimeout(10000);

// Global setup - runs once before all tests
beforeAll(async () => {
  // Disconnect any existing connection (in case server.js connected)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await setupDatabase();
  console.log('Test database connected!');
});

// Global teardown - runs once after all tests
afterAll(async () => {
  await teardownDatabase();
  console.log('Test database connection closed');
});

// Clear database between tests
beforeEach(async () => {
  await clearDatabase();
});