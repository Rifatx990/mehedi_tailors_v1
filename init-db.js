import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

const pool = new Pool(process.env.DATABASE_URL ? { 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
} : {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'mehedi_atelier',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'Mehedi Tailors & Fabrics',
    site_logo TEXT,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_secure BOOLEAN DEFAULT true,
    is_enabled BOOLEAN DEFAULT false,
    db_version TEXT DEFAULT '25.0.9-ARCH'
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

-- Note: Other tables (orders, users) are assumed to exist as per previous migrations.
`;

async function run() {
    console.log('[Schema] Initiating Production Handshake...');
    const client = await pool.connect();
    try {
        await client.query(SCHEMA);
        await client.query('INSERT INTO system_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING');
        console.log('[Schema] PostgreSQL Ledger Synchronized.');
    } finally {
        client.release();
        await pool.end();
    }
}
run();