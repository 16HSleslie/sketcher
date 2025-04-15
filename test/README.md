# Testing Documentation

This document provides guidelines and best practices for testing in the Book-Bindery application, with special attention to Mongoose/Jest compatibility.

## Test Directory Structure

- `test/server/` - Server-side API and model tests
- `test/server/api/` - API endpoint tests
- `test/server/unit/` - Unit tests for models and utilities
- `test/server/integration/` - Integration tests that test multiple components together
- `src/app/admin/components/*/*.spec.ts` - Angular component tests

## Testing Environment

### Server Tests

Server tests run in a Node.js environment with an in-memory MongoDB database provided by `mongodb-memory-server`. This allows for isolated testing without requiring an external MongoDB instance.

### Client Tests

Client tests for Angular components run in a browser-like environment with Jest and `jest-preset-angular`.

## Mongoose with Jest Best Practices

We follow the official Mongoose recommendations for testing with Jest as outlined in [the Mongoose documentation](https://mongoosejs.com/docs/jest.html):

1. **Test Environment**: Server tests use `testEnvironment: 'node'` as recommended by Mongoose, not the default 'jsdom' environment.

2. **Jest Warnings**: We use `SUPPRESS_JEST_WARNINGS=1` to suppress warnings from Mongoose that are safe to ignore.

3. **Timer Functions**: We carefully handle global timer functions (setTimeout, setImmediate) to ensure they're not mocked in a way that would interfere with Mongoose's internal operations.

4. **Connection Handling**: Database connections are properly set up and torn down for each test in `test/setup.js`.

5. **Buffer Commands**: We disable Mongoose's buffer commands feature to prevent Jest from hanging on some operations.

## Running Tests

### Server Tests

```bash
# Run all server tests
npm run test:server

# Run specific server test types
npm run test:unit  # Model/unit tests
npm run test:api   # API tests

# Run with coverage
npm run test:coverage
```

### Client Tests

```bash
# Run Angular component tests
npm run test:client
```

## Test Database

The server tests use `mongodb-memory-server` to create an isolated in-memory MongoDB instance for testing. This approach:

- Eliminates the need for an external test database
- Ensures tests start with a clean state
- Provides faster test execution
- Works consistently in CI/CD environments

## Common Issues and Solutions

1. **Jest Timer Mocks**: If you need to mock timers for testing purposes, make sure to import Mongoose BEFORE calling `jest.useFakeTimers()`.

2. **Connection Issues**: The test setup ensures proper cleanup of database connections between tests. If you encounter connection issues, check that the `teardownDatabase` function is being called properly.

3. **Test Timeouts**: For operations that take longer than the default timeout, use `jest.setTimeout(10000)` to extend the timeout.

4. **Conflicting Libraries**: When adding new packages, ensure they don't interfere with Mongoose's operations or mocking behavior. 