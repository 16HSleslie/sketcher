const mongoose = require('mongoose');
const config = require('../../config');

describe('Database Connection', () => {
  beforeAll(async () => {
    // Use a test database
    const testMongoUri = process.env.TEST_MONGO_URI || config.MONGO_URI;
    await mongoose.connect(testMongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
}); 