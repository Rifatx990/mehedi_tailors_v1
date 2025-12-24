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
        // This mounts the Express app to /api. 
        // Requests to /api/health will reach Express as /health.
        server.middlewares.use('/api', app);
      },
    },
  ],
});