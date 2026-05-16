import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@hetcho/shared': resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: { port: 3001 },
});
