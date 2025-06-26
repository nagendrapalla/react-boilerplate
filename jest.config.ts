module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.ts'], // Path to your setup file
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    // Map the '@' alias to the 'src' directory
    '^@/(.*)$': '<rootDir>/src/$1',
    // Map 'ti-react-template/template-components/*' to the correct directory
    '^ti-react-template/components$': '<rootDir>/template-components',
    

  },
  coverageThreshold: {
    'src/**/*.{,tsx}': {
      lines: 80,
      statements: 80,
      functions: 80,
      
    },
  },
  collectCoverage: true, // Enable coverage collection
  collectCoverageFrom: [
    'src/**/*.{,tsx}', // Include all TypeScript files under src/
    'template-components/**/*.{,tsx}',
    '!src/App.tsx',
    '!src/**/*.d.ts', // Exclude TypeScript declaration files
    '!src/**/*.test.{ts,tsx}', // Optionally exclude test files from coverage (if inside src)
    '!src/**/index.ts', // Optionally exclude index.ts files (if not needed in coverage)
    '!src/routes/**', // Exclude files in the 'routes' directory
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  testMatch: [
    '**/src/**/*.(test|spec).{ts,tsx}',  // Test files in the 'src' directory
    '**/template-components/**/*.(test|spec).{ts,tsx}', // Test files in 'template-components'
    '**/*.test.{ts,tsx}', // Test files with '.test' in any folder
    '**/*.spec.{ts,tsx}', // Test files with '.spec' in any folder
  ],
};
