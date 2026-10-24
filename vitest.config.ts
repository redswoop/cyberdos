import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    // web tests get a DOM; core tests don't care
    environmentMatchGlobs: [['test/web/**', 'jsdom']],
    environment: 'node',
  },
});
