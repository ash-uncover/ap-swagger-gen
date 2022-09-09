module.exports = {
    "modulePaths": [
      "tools",
    ],
    "testMatch": [
      "**/tools/**/*.spec.ts"
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
      "tools/**/*.ts",
      "!tools/**/*.script.ts",
      "!**/node_modules/**",
    ],
    "coverageDirectory": "target/coverage-tools",
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