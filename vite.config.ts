import { defineConfig } from 'vite';
import express from 'express';
import { app as artisanRouter } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173, // Changed from 5000 to avoid conflict with standalone server and proxy loops
    strictPort: true,
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        const apiApp = express();
        // Vite middleware doesn't parse bodies by default, Express must do it
        apiApp.use(express.json({ limit: '50mb' }));
        apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
        
        // Log API requests for debugging
        apiApp.use((req, res, next) => {
          if (!req.url.includes('health')) {
            console.log(`[API-Gateway] ${req.method} ${req.url}`);
          }
          next();
        });

        // Mount the production router
        apiApp.use(artisanRouter);
        
        // Final middleware mount at /api prefix
        server.middlewares.use('/api', apiApp);
      },
    },
  ],
});