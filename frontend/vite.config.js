import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'globalThis'
  },
  server: {
    // Open admin UI directly in dev (useful for frontend-only testing)
    open: '/admin',
    proxy: {
      // API Gateway runs on 8090 in this workspace (see ReppartonMicroservices/api-gateway)
      '/api': 'http://localhost:8090',
    }
  }
});