const base = require('./base');

module.exports = {
  ...base({ path: 'e2e' }),
  displayName: 'e2e',
  testRegex: '^.*/__e2e__/.*\\.test\\.tsx?$',
  moduleNameMapper: {
    '^@neo-one/ec-key': '@neo-one/ec-key',
    '^@neo-one/boa': '@neo-one/boa',
    '^@neo-one/csharp': '@neo-one/csharp',
    '^@neo-one/(.+)-es2018-cjs': '<rootDir>/dist/neo-one-es2018-cjs/packages/neo-one-$1',
    '^@neo-one/(.+)': '<rootDir>/dist/neo-one-es2018-cjs/packages/neo-one-$1',
    '^@reactivex/ix-esnext-esm(.*)': '@reactivex/ix-esnext-cjs$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/package.json',
    '<rootDir>/packages/[a-z-]+/package.json',
    '<rootDir>/dist/neo-one[a-z0-9-]+/package.json',
    '<rootDir>/dist/neo-one[a-z0-9-]+/packages/package.json',
  ],
};