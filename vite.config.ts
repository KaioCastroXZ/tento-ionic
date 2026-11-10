import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  // O Ionic sozinho já passa de 500 kB; o app é 100% offline, então o tamanho do bundle não afeta a rede.
  build: { chunkSizeWarningLimit: 1600 },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Playwright e2e specs live in e2e/.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
