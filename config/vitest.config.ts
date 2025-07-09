import { defineConfig } from 'vitest/config';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [join(__dirname, '../tests/**/*.test.ts')],
    testTimeout: 60000, // 60 seconds for Playground initialization
    hookTimeout: 60000,
  },
});