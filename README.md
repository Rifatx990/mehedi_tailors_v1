
# Mehedi Tailors & Fabrics — PostgreSQL Enterprise Suite

This application is powered by a **Relational PostgreSQL Backend**. This ensures industrial-grade persistence, ACID compliance, and multi-user concurrency.

---

## 🐘 PostgreSQL Migration Guide

### 1. Database Provisioning
You must have a PostgreSQL instance running (v14 or higher recommended).
1. Create a new database: `CREATE DATABASE mehedi_atelier;`
2. Apply the schema: `psql -d mehedi_atelier -f database.sql`
3. Load bootstrap data: `psql -d mehedi_atelier -f seeder.sql`

### 2. Backend Startup
The application requires a Node.js runtime for the API server.
1. Ensure the following dependencies are installed: `npm install express pg cors body-parser`.
2. Configure environment variables (optional) or use the defaults in `server.js`.
3. Start the server: `node server.js`
   * The server will run on `http://localhost:3001`.

### 3. Frontend Handshake
The React frontend is configured to point to `localhost:3001/api`. Ensure the server is running before interacting with the UI. Login checking is now performed against the database records fetched on startup.

---

## 🔐 Administrative Access
Default credentials (from `seeder.sql`):
- **Admin**: `admin@meheditailors.com` / `admin123`
- **Worker**: `worker@meheditailors.com` / `worker123`

*Engineered for Sartorial Sovereignty. Persisted for Generations.*
