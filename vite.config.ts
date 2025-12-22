import { defineConfig } from 'vite';
import { app } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        server.middlewares.use(app);
      },
    },
  ],
});