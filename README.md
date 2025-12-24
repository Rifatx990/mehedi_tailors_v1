# Mehedi Tailors & Fabrics | Bespoke ERP & Artisan Gateway

An industrial-grade Enterprise Resource Planning (ERP) suite tailored for high-end bespoke studios. Powered by a **PostgreSQL** relational engine, **SSLCommerz** + **bKash** digital gateways, and **Gemini AI** for sartorial intelligence.

---

## 🏛️ Architectural Stack

-   **Frontend**: React 19 (ESM) + Tailwind CSS 3
-   **Backend**: Node.js + Express (RESTful Gateway)
-   **Database**: PostgreSQL 14+ (Relational Persistence)
-   **Payment**: SSLCommerz V4 + bKash Tokenized Checkout
-   **AI Intelligence**: Google Gemini API
-   **Infrastructure**: Vite 6 Proxy Architecture

## 🚀 Rapid Deployment

### 1. Prerequisite Checklist
-   Node.js (LTS recommended)
-   PostgreSQL Server
-   Gemini API Key
-   SSLCommerz & bKash Credentials

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

# bKash Configuration
BKASH_BASE_URL=https://checkout.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password

# AI Core
API_KEY=your_gemini_api_key
```

### 3. Ignition Sequence
```bash
npm install
npm start
```
---
*Engineered for Sartorial Sovereignty. Handcrafted in Ashulia, Savar.*