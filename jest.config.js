module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'app/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  // Each test gets a fresh Mongoose context
  testTimeout: 10000,
  setupFilesAfterEnv: ['./test/jest.setup.js'],
  // Group tests by directory
  testMatch: [
    '**/test/server/**/*.test.js'
  ],
  // Add clear names for test suites
  displayName: {
    name: 'Book-Bindery',
    color: 'blue'
  }
}; 