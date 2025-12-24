import { defineConfig } from 'vite';
import express from 'express';
import { app as artisanRouter } from './server.js';

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
        // Create a wrapper app to ensure standard Express behavior inside Connect
        const apiApp = express();
        apiApp.use(express.json());
        apiApp.use(artisanRouter);
        
        // Mount at /api. connect-middleware strips the prefix before passing to apiApp
        server.middlewares.use('/api', apiApp);
      },
    },
  ],
});