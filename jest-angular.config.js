module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: [
    '<rootDir>/setup-angular-tests.ts'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/test/'],
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
    '**/src/app/**/*.spec.ts'
  ],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
    '@core/(.*)': '<rootDir>/src/app/core/$1',
    '@shared/(.*)': '<rootDir>/src/app/shared/$1',
    '@admin/(.*)': '<rootDir>/src/app/admin/$1',
  },
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      isolatedModules: true
    }]
  },
  transformIgnorePatterns: ['node_modules/(?!@angular|rxjs)'],
  moduleDirectories: [
    'node_modules',
    'src'
  ]
}; 