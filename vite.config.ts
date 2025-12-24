import { defineConfig } from 'vite';
import { app } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true, // Allows all hosts to prevent 403 on various environments
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        // Mount the Express app to /api path.
        // Incoming /api/health becomes /health in the Express app.
        server.middlewares.use('/api', app);
      },
    },
  ],
});