# Mehedi Tailors & Fabrics | Bespoke ERP

Industrial-grade tailoring suite with PostgreSQL persistence and dual-gateway (SSLCommerz + bKash) payments.

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
PORT=3000

# PostgreSQL Configuration
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=mehedi_atelier
# Or use a full URL:
# DATABASE_URL=postgres://user:pass@host:port/dbname

# Toggle bKash payment mode
BKASH_IS_LIVE=false   # true = LIVE | false = SANDBOX

# bKash URLs
BKASH_SANDBOX_URL=https://checkout.sandbox.bka.sh/v1.2.0-beta
BKASH_LIVE_URL=https://checkout.pay.bka.sh/v1.2.0-beta

# bKash Credentials
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password

# SSLCommerz Configuration
SSL_STORE_ID=your_id
SSL_STORE_PASS=your_pass
SSL_IS_LIVE=false

# App Base (For callbacks)
APP_BASE_URL=http://localhost:3000
```

## 🚀 Ignition

1. **Initialize Database**: `npm run db:init`
2. **Start Dev Server**: `npm run dev`

---
*Engineered for Sartorial Sovereignty.*