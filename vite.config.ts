import { defineConfig } from 'vite';
import { app } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    strictPort: true
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        // Mount Express app to /api prefix.
        // Frontend calls to /api/health will strip /api and reach Express as /health.
        server.middlewares.use('/api', app);
      },
    },
  ],
});