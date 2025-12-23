# Mehedi Tailors & Fabrics | Bespoke ERP & Artisan Gateway

An industrial-grade Enterprise Resource Planning (ERP) suite tailored for high-end bespoke studios. Powered by a **PostgreSQL** relational engine, **SSLCommerz** digital gateway, and **Gemini AI** for sartorial intelligence.

---

## 🏛️ Architectural Stack

-   **Frontend**: React 19 (ESM) + Tailwind CSS 3
-   **Backend**: Node.js + Express (RESTful Gateway)
-   **Database**: PostgreSQL 14+ (Relational Persistence)
-   **Payment**: SSLCommerz V4 (Authorized Digital Settlement)
-   **AI Intelligence**: Google Gemini API (Styling & Design Consultations)
-   **Infrastructure**: Vite 6 Proxy Architecture

## 🚀 Rapid Deployment

### 1. Prerequisite Checklist
-   Node.js (LTS recommended)
-   PostgreSQL Server (Local or Cloud Instance)
-   Gemini API Key
-   SSLCommerz Sandbox/Live Store Credentials

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Credentials
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mehedi_atelier

# SSLCommerz Configuration
SSL_STORE_ID=your_store_id
SSL_STORE_PASS=your_store_password
SSL_IS_LIVE=false
APP_BASE_URL=http://localhost:5000

# Email (SMTP) Core
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

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

## 🔐 Fiscal Integrity & IPN
This system employs a **Server-to-Server Validation** protocol. Browser redirects alone are never trusted. The backend verifies payment directly with the `validator/api` before committing to the ledger. **IPN (Instant Payment Notification)** ensure consistency even if a patron's session times out.

## 🧵 Artisan Logic
-   **Bespoke Silhouettes**: Measurements are stored as high-fidelity JSONB payloads.
-   **Label Studio**: Industrial QR/SKU generation system for workshop tracking.
-   **Fiscal Ledger**: Recovery tracking for outstanding patron balances.

---
*Engineered for Sartorial Sovereignty. Handcrafted in Ashulia, Savar.*