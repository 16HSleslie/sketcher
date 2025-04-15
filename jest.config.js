module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: [
    '<rootDir>/setup-jest.ts',
    '<rootDir>/src/testing/mock-helper.ts'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/app/admin/**/*.ts',
    '!src/app/admin/**/*.module.ts',
    '!src/app/admin/models/**/*.ts',
  ],
  coverageReporters: ['html', 'text-summary'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  testMatch: [
    '**/*.spec.ts',
    '**/test/**/*.test.js'
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
    '@core/(.*)': '<rootDir>/src/app/core/$1',
    '@shared/(.*)': '<rootDir>/src/app/shared/$1',
    '@admin/(.*)': '<rootDir>/src/app/admin/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      isolatedModules: true
    }
  },
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: ['node_modules/(?!@angular|rxjs)']
}; 