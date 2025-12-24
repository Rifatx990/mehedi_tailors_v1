import { defineConfig } from 'vite';
import { app } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        // This mounts the Express app to /api. 
        // Requests like /api/health will reach Express as /health.
        server.middlewares.use('/api', app);
      },
    },
  ],
});