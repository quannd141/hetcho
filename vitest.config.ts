import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.{test,spec}.ts', 'apps/**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
  resolve: {
    alias: {
      '@hetcho/shared': resolve(__dirname, 'packages/shared/src'),
      '@hetcho/domain': resolve(__dirname, 'packages/domain/src'),
      '@hetcho/application': resolve(__dirname, 'packages/application/src'),
      '@hetcho/infrastructure': resolve(__dirname, 'packages/infrastructure/src'),
      '@hetcho/db': resolve(__dirname, 'packages/db/src'),
    },
  },
});
