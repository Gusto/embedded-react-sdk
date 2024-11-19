import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'
/**
 * Jest Configuration.
 *
 * @see https://jestjs.io/docs/configuration
 */
export default <JestConfigWithTsJest>{
  roots: ['./src', './test'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jest-fixed-jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  },
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/mocks/fileMock.js',
    '.(css|scss|sass)$': '<rootDir>/test/mocks/styleMock.js',
    '^.+\\.svg$': 'jest-transformer-svg',
  },
  coverageProvider: 'v8',
  collectCoverage: false,
  collectCoverageFrom: ['./src/{helpers,utils}/**/*.ts'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['./jest.setup.ts'],
}
