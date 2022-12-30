export default {
  testMatch: ['**/test/**/*.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'esbuild-jest',
  },
  testEnvironment: 'miniflare',
}
