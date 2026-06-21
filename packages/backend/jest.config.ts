import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@pm-system/shared$': '<rootDir>/../shared/src/index.ts',
    '^@pm-system/shared/(.*)$': '<rootDir>/../shared/src/$1',
    // Resolve .js extension imports in @pm-system/shared to .ts files
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
