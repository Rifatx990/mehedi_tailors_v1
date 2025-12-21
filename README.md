# Mehedi Tailors & Fabrics | Bespoke ERP & Artisan Gateway

An industrial-grade Enterprise Resource Planning (ERP) suite tailored for high-end bespoke studios. Powered by a **PostgreSQL** relational engine and **Gemini AI** for sartorial intelligence.

---

## 🏛️ Architectural Stack

-   **Frontend**: React 19 (ESM) + Tailwind CSS 3
-   **Backend**: Node.js + Express (RESTful Gateway)
-   **Database**: PostgreSQL 14+ (Relational Persistence)
-   **AI Intelligence**: Google Gemini API (Styling & Design Consultations)
-   **Infrastructure**: Vite 6 Proxy Architecture

## 🚀 Rapid Deployment

### 1. Prerequisite Checklist
-   Node.js (LTS recommended)
-   PostgreSQL Server (Local or Cloud Instance)
-   Gemini API Key (Exported as `API_KEY`)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Credentials
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mehedi_atelier

# AI Core
API_KEY=your_gemini_api_key
```

### 3. Ignition Sequence
```bash
npm install
npm start
```
*The startup sequence automatically executes `init-db.js` to provision schema and seed data.*

---

## 🐘 Database Synchronicity
This system employs a **File-Aware Proxy** during development and a direct **Relational Handshake** in production.
-   **Gateway URL**: `http://localhost:3001/api`
-   **Schema Version**: v12.0.0 (Persistent SQL)
-   **Industrial Tracking**: Every transaction is logged with TIMESTAMPTZ precision for global audit compliance.

## 🧵 Artisan Logic
-   **Bespoke Silhouettes**: Measurements are stored as high-fidelity JSONB payloads for complex anatomical scaling.
-   **Label Studio**: Industrial QR/SKU generation system with built-in camera recognition.
-   **Fiscal Ledger**: Advanced recovery tracking for outstanding patron balances and artisan credits.

---
*Engineered for Sartorial Sovereignty. Handcrafted in Ashulia, Savar.*