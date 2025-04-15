// Test environment setup
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load environment variables
dotenv.config();

// In-memory MongoDB server for isolated testing
let mongoServer;

// Setup function to be called before tests
async function setupDatabase() {
  // Ensure any existing connections are closed first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database with recommended options
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Important for Mongoose/Jest compatibility: disable buffering
  // This helps prevent Jest from hanging on some operations
  mongoose.set('bufferCommands', false);
}

// Teardown function to be called after tests
async function teardownDatabase() {
  // Disconnect from database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Stop in-memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
}

// Clear all collections between tests
async function clearDatabase(skipCollections = []) {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    // Skip specified collections
    if (skipCollections.includes(key)) {
      continue;
    }
    await collection.deleteMany();
  }
}

module.exports = {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
}; 