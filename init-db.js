import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'mehedi_atelier',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
    };

const pool = new Pool(poolConfig);

const SCHEMA = `
-- ATELIER ARCHITECTURAL SCHEMA V14.0
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'Mehedi Tailors & Fabrics',
    site_logo TEXT,
    document_logo TEXT,
    db_version TEXT DEFAULT '14.0.0-PG-PRO',
    gift_card_denominations JSONB DEFAULT '[2000, 5000, 10000, 25000]',
    gift_cards_enabled BOOLEAN DEFAULT true,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    secure BOOLEAN DEFAULT true,
    sender_name TEXT,
    sender_email TEXT,
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

CREATE TABLE IF NOT EXISTS upcoming_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    expected_date TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS fabrics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    description TEXT,
    colors JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS bespoke_services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    image TEXT,
    base_price DECIMAL(12,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
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
    bespoke_note TEXT,
    bespoke_type TEXT,
    delivery_date TEXT
);

CREATE TABLE IF NOT EXISTS dues (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    customer_name TEXT,
    customer_email TEXT,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    settled_date TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true
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

CREATE TABLE IF NOT EXISTS gift_cards (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    balance DECIMAL(12,2) NOT NULL,
    initial_amount DECIMAL(12,2) NOT NULL,
    customer_email TEXT,
    customer_name TEXT,
    is_active BOOLEAN DEFAULT true,
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
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

CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    is_active BOOLEAN DEFAULT true
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
    date TEXT,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    template_id TEXT
);
`;

const SEED_DATA = {
  config: {
    id: 1, site_name: 'Mehedi Tailors & Fabrics', site_logo: 'https://i.imgur.com/8H9IeM5.png', document_logo: 'https://i.imgur.com/8H9IeM5.png', db_version: '14.0.0-PRO', gift_cards_enabled: true
  },
  partners: [
    { id: 'p_1', name: 'Scabal Brussels', logo: 'https://cdn.worldvectorlogo.com/logos/scabal-1.svg', is_active: true },
    { id: 'p_2', name: 'Loro Piana', logo: 'https://cdn.worldvectorlogo.com/logos/loro-piana.svg', is_active: true },
    { id: 'p_3', name: 'Dormeuil', logo: 'https://i.imgur.com/2XyE4xY.png', is_active: true },
    { id: 'p_4', name: 'Zegna', logo: 'https://cdn.worldvectorlogo.com/logos/zegna.svg', is_active: true }
  ],
  users: [
    { id: 'adm-001', name: 'Artisan Admin', email: 'admin@meheditailors.com', role: 'admin', password: 'admin123', phone: '+8801720267213', address: 'Atelier Savar' },
    { id: 'wrk-001', name: 'Kabir Master', email: 'worker@meheditailors.com', role: 'worker', password: 'worker123', phone: '+8801720267214', specialization: 'Master Stitcher', experience: '15 Years', join_date: '2024-01-01' }
  ],
  products: [
    { id: 'p1', name: 'Imperial Silk Panjabi', category: 'Men', price: 4500, discount_price: 3800, image: 'https://picsum.photos/seed/panjabi/600/800', description: 'Exquisite silk panjabi with hand-crafted embroidery.', fabric_type: 'Silk', available_sizes: JSON.stringify(['S', 'M', 'L', 'XL']), colors: JSON.stringify(['Cream', 'Deep Blue']), stock_count: 20, is_featured: true }
  ]
};

async function run() {
  console.log('--- MEHEDI ATELIER: DB INITIALIZATION V14 ---');
  try {
    const client = await pool.connect();
    await client.query(SCHEMA);

    const configCheck = await client.query('SELECT id FROM system_config WHERE id = 1');
    if (configCheck.rowCount === 0) {
      const c = SEED_DATA.config;
      await client.query('INSERT INTO system_config (id, site_name, site_logo, document_logo, db_version) VALUES ($1, $2, $3, $4, $5)', [c.id, c.site_name, c.site_logo, c.document_logo, c.db_version]);
    }

    for (const p of SEED_DATA.partners) {
        const check = await client.query('SELECT id FROM partners WHERE id = $1', [p.id]);
        if (check.rowCount === 0) await client.query('INSERT INTO partners (id, name, logo, is_active) VALUES ($1, $2, $3, $4)', [p.id, p.name, p.logo, p.is_active]);
    }

    for (const u of SEED_DATA.users) {
      const uCheck = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (uCheck.rowCount === 0) await client.query('INSERT INTO users (id, name, email, phone, address, role, password, specialization, experience, join_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [u.id, u.name, u.email, u.phone, u.address, u.role, u.password, u.specialization || null, u.experience || null, u.join_date || null]);
    }

    console.log('SUCCESS: Production Registry Synchronized.');
    client.release();
  } catch (err) {
    console.error('DB FAIL:', err.message);
  } finally {
    await pool.end();
  }
}

run();