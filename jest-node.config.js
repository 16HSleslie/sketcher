module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test/jest.setup.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/dist/'
  ],
  coverageReporters: ['html', 'text-summary'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json', 'node']
}; 