// Jest setup file that runs before tests
const { setupDatabase, teardownDatabase, clearDatabase } = require('./setup');

// Increase test timeout for slower operations
jest.setTimeout(10000);

// Global setup - runs once before all tests
beforeAll(async () => {
  await setupDatabase();
});

// Global teardown - runs once after all tests
afterAll(async () => {
  await teardownDatabase();
});

// Clear database between tests
beforeEach(async () => {
  await clearDatabase();
}); 