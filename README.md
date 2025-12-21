
# Mehedi Tailors & Fabrics — PostgreSQL Enterprise Suite

This application is powered by a **Relational PostgreSQL Backend**. This ensures industrial-grade persistence, ACID compliance, and multi-user concurrency for your artisan studio.

---

## 🐘 PostgreSQL Migration Guide

### 1. Database Provisioning
You must have a PostgreSQL instance running (v14 or higher recommended).
1. Create a new database: `CREATE DATABASE mehedi_atelier;`
2. Configure credentials (see Step 2).

### 2. Environment Configuration
Create a `.env` file in the project root to store your database secrets. **Do not commit this file to version control.**

```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mehedi_atelier
```

### 3. Automated Startup
The system is now fully automated and uses ES Modules. Running the start command will:
- Initialize the database schema (`database.sql`)
- Seed default artisan data (`seeder.sql`)
- Launch the API backend on `localhost:3001`
- Launch the React frontend

**Command:**
```bash
npm install
npm start
```

---

## 🔐 Administrative Access
Default credentials (provisioned via `seeder.sql`):
- **Admin**: `admin@meheditailors.com` / `admin123`
- **Worker**: `worker@meheditailors.com` / `worker123`

*Engineered for Sartorial Sovereignty. Persisted for Generations.*
