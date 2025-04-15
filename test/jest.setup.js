const { setupDatabase, teardownDatabase, clearDatabase } = require('./setup');
const mongoose = require('mongoose');

// Increase test timeout for slower operations
jest.setTimeout(10000);

// Prevent Jest from messing with the global setTimeout/setImmediate that Mongoose relies on
// This is critical per Mongoose's Jest docs
const originalSetTimeout = global.setTimeout;
const originalSetImmediate = global.setImmediate;
const originalClearTimeout = global.clearTimeout;

// Global setup - runs once before all tests
beforeAll(async () => {
  // Restore any timer-related functions that might have been mocked
  global.setTimeout = originalSetTimeout;
  global.setImmediate = originalSetImmediate;
  global.clearTimeout = originalClearTimeout;
  
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

// Clear database between tests but preserve needed collections for test continuity
beforeEach(async () => {
  await clearDatabase(['admins', 'products', 'orders']); // Skip clearing certain collections
});