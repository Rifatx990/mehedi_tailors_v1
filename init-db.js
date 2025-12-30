import { pool } from './db.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'Mehedi Tailors & Fabrics',
    site_logo TEXT,
    document_logo TEXT,
    db_version TEXT DEFAULT '25.0.9-ARCH',
    gift_card_denominations JSONB DEFAULT '[2000, 5000, 10000, 25000]',
    gift_cards_enabled BOOLEAN DEFAULT true,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_secure BOOLEAN DEFAULT true,
    is_enabled BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT CHECK (role IN ('admin', 'customer', 'worker')),
    password TEXT NOT NULL,
    specialization TEXT,
    experience TEXT,
    join_date TEXT,
    measurements JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Pending',
    production_step TEXT DEFAULT 'Queue',
    payment_status TEXT DEFAULT 'Due',
    assigned_worker_id TEXT REFERENCES users(id),
    total DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    due_amount DECIMAL(12,2) DEFAULT 0,
    payment_method TEXT,
    items JSONB NOT NULL,
    address TEXT,
    customer_name TEXT,
    customer_email TEXT,
    phone TEXT,
    coupon_used TEXT,
    bespoke_note TEXT,
    bespoke_type TEXT,
    delivery_date TEXT
);

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    payload JSONB,
    status TEXT CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
    error_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

const MIGRATIONS = [
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS bespoke_note TEXT",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS bespoke_type TEXT",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date TEXT",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT",
    "ALTER TABLE system_config ADD COLUMN IF NOT EXISTS gift_cards_enabled BOOLEAN DEFAULT true"
];

async function run() {
    console.log('[Init] Negotiating with PostgreSQL host...');
    let client;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        try {
            client = await pool.connect();
            console.log('[Init] Connection established. Applying schema...');
            
            await client.query(SCHEMA);
            
            for (const migration of MIGRATIONS) {
                try {
                    await client.query(migration);
                } catch (mErr) {
                    // Silently ignore already-applied migrations
                }
            }

            // Ensure Admin User
            await client.query(`
                INSERT INTO users (id, name, email, role, password) 
                VALUES ('adm-001', 'System Admin', 'admin@meheditailors.com', 'admin', 'admin123') 
                ON CONFLICT (id) DO NOTHING
            `);

            // Ensure Config
            await client.query('INSERT INTO system_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING');

            console.log('[Init] Authoritative Ledger Synchronized Successfully.');
            return;

        } catch (err) {
            attempts++;
            console.error(`[Init] Handshake attempt ${attempts} failed: ${err.message}`);
            if (attempts < maxAttempts) {
                console.log('[Init] Retrying in 3 seconds...');
                await new Promise(res => setTimeout(res, 3000));
            } else {
                console.error('[Init] CRITICAL: Maximum connection attempts reached. Termination enforced.');
                process.exit(1);
            }
        } finally {
            if (client) client.release();
        }
    }
}

run();