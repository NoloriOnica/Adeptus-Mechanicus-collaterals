import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@adeptus/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  // Disable the default public dir — assets are imported as modules directly
  publicDir: false,
});
