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
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Teardown function to be called after tests
async function teardownDatabase() {
  // Disconnect from database
  await mongoose.disconnect();
  
  // Stop in-memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
}

// Clear all collections between tests
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}

module.exports = {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
}; 