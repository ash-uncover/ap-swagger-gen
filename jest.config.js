module.exports = {
    "modulePaths": [
      "src",
    ],
    "testMatch": [
      "**/src/**/*.spec.ts"
    ],
    "moduleFileExtensions": [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'node',
    ],
    "transform": {
      '^.+\\.ts?$': 'ts-jest',
    },
    "collectCoverageFrom": [
      "src/**/*.ts",
      "!src/**/*.script.ts",
      "!**/node_modules/**",
    ],
    "coverageDirectory": "__coverage",
    "coverageThreshold": {
      "global": {
        "branches": 100,
        "functions": 100,
        "lines": 100,
        "statements": 100,
      },
    },
    "coverageReporters": [
      "json",
      "lcov",
      "text",
      "text-summary",
    ],
  }