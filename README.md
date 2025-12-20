# Mehedi Tailors & Fabrics — PostgreSQL Enterprise Suite

This application is architected for a **Relational PostgreSQL Backend**. This ensures ACID compliance, industrial-grade persistence, and multi-user concurrency for your artisan studio.

---

## 🐘 PostgreSQL Migration Guide

### 1. Database Provisioning
You must have a PostgreSQL instance running (v14 or higher recommended).
1. Create a new database: `CREATE DATABASE mehedi_atelier;`
2. Apply the schema: `psql -d mehedi_atelier -f schema.sql`
3. Load bootstrap data: `psql -d mehedi_atelier -f seeders.sql`

### 2. Backend Integration
The frontend communicates via a standardized REST API (`/api/v1`). You must implement a backend (Node.js/Express, PHP/Laravel, or Python/FastAPI) that maps these endpoints to the Postgres tables defined in `schema.sql`.

| Method | Endpoint | Responsibility |
| :--- | :--- | :--- |
| **GET** | `/users` | Returns normalized User records. |
| **POST** | `/orders` | Atomically creates a new commission. |
| **PUT** | `/products/:id` | Updates inventory and stock levels. |
| **GET** | `/config` | Returns the `system_config` singleton (ID 1). |

### 3. Data Structure Notes
-   **JSONB Columns**: Fields like `measurements`, `items`, and `images` use the `JSONB` type. This allows for flexible NoSQL-like storage while remaining inside a rigid relational table.
-   **Atomic Operations**: Unlike file-based sync, the UI now performs atomic updates per entity. This prevents race conditions in multi-admin environments.

---

## 🔐 Default Access Credentials
Use these identities to access the Administrative and Artisan consoles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@meheditailors.com` | `admin123` |
| **Worker** | `worker@meheditailors.com` | `worker123` |

*Engineered for Sartorial Sovereignty. Persisted for Generations.*