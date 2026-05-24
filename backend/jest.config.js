module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.js',
    '<rootDir>/src/__tests__/**/*.integration.test.js',
  ],
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'json'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/__tests__/**',
  ],
};