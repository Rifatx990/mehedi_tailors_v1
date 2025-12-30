import { defineConfig } from 'vite';
import express from 'express';
import { app as artisanRouter } from './server.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    strictPort: true,
    proxy: {
      // If middleware fails, this acts as a fallback for internal routing
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  plugins: [
    {
      name: 'express-api-middleware',
      configureServer(server) {
        const apiApp = express();
        // Crucial: Vite middleware doesn't parse bodies by default
        apiApp.use(express.json({ limit: '50mb' }));
        apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
        
        // Log API requests for debugging
        apiApp.use((req, res, next) => {
          console.log(`[API-Proxy] ${req.method} ${req.url}`);
          next();
        });

        apiApp.use(artisanRouter);
        
        // Mount at /api
        server.middlewares.use('/api', apiApp);
      },
    },
  ],
});