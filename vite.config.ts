import { defineConfig } from 'vite';
import { app } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    // Port 5000 is default for Vite in this environment
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        // Express app is mounted directly to the dev server
        // This handles /api routes without needing a separate proxy block
        server.middlewares.use(app);
      },
    },
  ],
});