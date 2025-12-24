import { defineConfig } from 'vite';
import { app } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        // This mounts the Express app to /api. 
        // A request to http://localhost:3000/api/health 
        // will reach the Express app as GET /health.
        server.middlewares.use('/api', app);
      },
    },
  ],
});