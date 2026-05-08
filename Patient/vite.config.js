import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests to the backend running on localhost:3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // rewrite optional if backend expects no /api prefix, but it does, so keep path
        // rewrite: path => path.replace(/^\/api/, '/api')
      }
    }
  }
});
