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

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price DECIMAL(12,2) NOT NULL,
    discount_price DECIMAL(12,2),
    image TEXT,
    images JSONB DEFAULT '[]',
    description TEXT,
    fabric_type TEXT,
    available_sizes JSONB DEFAULT '[]',
    colors JSONB DEFAULT '[]',
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false
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
    delivery_date TEXT,
    ssl_tran_id TEXT,
    bkash_trx_id TEXT
);

CREATE TABLE IF NOT EXISTS fabrics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    description TEXT,
    colors JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    expiry_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    content TEXT,
    type TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    discount_tag TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS bespoke_services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    image TEXT,
    base_price DECIMAL(12,2),
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT,
    logo TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS dues (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    customer_name TEXT,
    customer_email TEXT,
    amount DECIMAL(12,2),
    reason TEXT,
    status TEXT DEFAULT 'pending',
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    settled_date TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_requests (
    id TEXT PRIMARY KEY,
    worker_id TEXT REFERENCES users(id),
    worker_name TEXT,
    material_name TEXT,
    quantity TEXT,
    status TEXT DEFAULT 'pending',
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS product_requests (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    email TEXT,
    product_title TEXT,
    description TEXT,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_name TEXT,
    rating INTEGER,
    comment TEXT,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS upcoming_products (
    id TEXT PRIMARY KEY,
    name TEXT,
    image TEXT,
    expected_date TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS gift_cards (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    balance DECIMAL(12,2),
    initial_amount DECIMAL(12,2),
    customer_email TEXT,
    customer_name TEXT,
    is_active BOOLEAN DEFAULT true,
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    payload JSONB,
    status TEXT DEFAULT 'PENDING',
    error_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

async function run() {
    console.log('[Init] Establishing PostgreSQL Master Ledger Schema...');
    let client;
    try {
        client = await pool.connect();
        await client.query(SCHEMA);
        
        // Ensure Primary Admin
        await client.query(`
            INSERT INTO users (id, name, email, role, password) 
            VALUES ('adm-001', 'System Admin', 'admin@meheditailors.com', 'admin', 'admin123') 
            ON CONFLICT (id) DO NOTHING
        `);

        // Ensure Initial System Config
        await client.query('INSERT INTO system_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING');

        console.log('[Init] Authoritative Ledger Ready.');
    } catch (err) {
        console.error(`[Init] CRITICAL FAILURE: ${err.message}`);
        process.exit(1);
    } finally {
        if (client) client.release();
    }
}

run();