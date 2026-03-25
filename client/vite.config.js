import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to the Express backend during development
    proxy: {
      // SSE endpoint needs special handling to avoid proxy buffering
      '/api/stream': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        headers: { 'Cache-Control': 'no-transform' },
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
