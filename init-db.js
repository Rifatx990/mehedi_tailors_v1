import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'mehedi_atelier',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
    };

const pool = new Pool(poolConfig);

const SCHEMA = `
-- ATELIER ARCHITECTURAL SCHEMA V12.0
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'Mehedi Tailors & Fabrics',
    site_logo TEXT,
    document_logo TEXT,
    db_version TEXT DEFAULT '12.0.0-PG-REST',
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
    customer_email TEXT
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
    id: 1, site_name: 'Mehedi Tailors & Fabrics', site_logo: 'https://i.imgur.com/8H9IeM5.png', document_logo: 'https://i.imgur.com/8H9IeM5.png', db_version: '12.0.0-PROG', gift_cards_enabled: true
  },
  users: [
    { id: 'adm-001', name: 'Artisan Admin', email: 'admin@meheditailors.com', role: 'admin', password: 'admin123', phone: '+8801720267213', address: 'Atelier Savar' },
    { id: 'wrk-001', name: 'Kabir Master', email: 'worker@meheditailors.com', role: 'worker', password: 'worker123', phone: '+8801720267214', specialization: 'Master Stitcher', experience: '15 Years', join_date: '2024-01-01' },
    { id: 'usr-001', name: 'Arif Ahmed', email: 'customer@meheditailors.com', role: 'customer', password: 'customer123', phone: '+8801711223344', address: 'Dhanmondi, Dhaka' }
  ],
  products: [
    { id: 'p1', name: 'Premium Silk Panjabi', category: 'Men', price: 4500, discount_price: 3800, image: 'https://picsum.photos/seed/panjabi/600/800', description: 'Exquisite silk panjabi with hand-crafted embroidery.', fabric_type: 'Silk', available_sizes: JSON.stringify(['S', 'M', 'L', 'XL']), colors: JSON.stringify(['Cream', 'Deep Blue']), stock_count: 20, is_featured: true },
    { id: 'p2', name: 'Italian Executive Shirt', category: 'Men', price: 2800, image: 'https://picsum.photos/seed/shirt/600/800', description: 'Giza cotton executive shirt for professionals.', fabric_type: 'Cotton', available_sizes: JSON.stringify(['38', '40', '42', '44']), colors: JSON.stringify(['Sky Blue', 'White']), stock_count: 50, is_featured: true }
  ],
  fabrics: [
    { id: 'f1', name: 'Giza Cotton', image: 'https://picsum.photos/seed/giza/400/400', description: 'Egyptian cotton of the highest grade.' },
    { id: 'f2', name: 'Irish Linen', image: 'https://picsum.photos/seed/linen/400/400', description: 'Authentic heavy-duty Irish linen.' }
  ],
  services: [
    { id: 's1', name: 'Shirt', icon: '👔', base_price: 1200, description: 'Hand-tailored custom shirts.' },
    { id: 's2', name: 'Suit', icon: '🧥', base_price: 15000, description: 'Bespoke three-piece suiting.' },
    { id: 's3', name: 'Panjabi', icon: '🕌', base_price: 2500, description: 'Artisan crafted traditional wear.' }
  ],
  banners: [
    { id: 'b1', title: 'The Artisan Way', subtitle: 'Global connectivity meets heritage craftsmanship.', image_url: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f6f9?q=80&w=2080', link_url: '/shop' }
  ],
  notices: [
    { id: 'n1', content: 'Central Database v12.0 Online. All artisan nodes synchronized.', type: 'info', isActive: true }
  ],
  offers: [
    { id: 'o1', title: 'Corporate Fitting', description: 'Special rates for corporate bulk bespoke orders.', discount_tag: '15% OFF', image_url: 'https://picsum.photos/seed/corp/600/400', link_url: '/shop' }
  ]
};

async function run() {
  console.log('--- MEHEDI ATELIER: INITIALIZING AUTHORITATIVE DB ---');
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Bridge Established.');

    console.log('Deploying Relational Schema...');
    await client.query(SCHEMA);

    const configCheck = await client.query('SELECT id FROM system_config WHERE id = 1');
    if (configCheck.rowCount === 0) {
      console.log('Seeding Master Config...');
      const c = SEED_DATA.config;
      await client.query(
        'INSERT INTO system_config (id, site_name, site_logo, document_logo, db_version) VALUES ($1, $2, $3, $4, $5)',
        [c.id, c.site_name, c.site_logo, c.document_logo, c.db_version]
      );
    }

    for (const u of SEED_DATA.users) {
      const uCheck = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (uCheck.rowCount === 0) {
        console.log(`Seeding Identity: ${u.name} (${u.role})`);
        await client.query(
          'INSERT INTO users (id, name, email, phone, address, role, password, specialization, experience, join_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [u.id, u.name, u.email, u.phone, u.address, u.role, u.password, u.specialization || null, u.experience || null, u.join_date || null]
        );
      }
    }

    for (const p of SEED_DATA.products) {
      const pCheck = await client.query('SELECT id FROM products WHERE id = $1', [p.id]);
      if (pCheck.rowCount === 0) {
        console.log(`Seeding Asset: ${p.name}`);
        await client.query(
          'INSERT INTO products (id, name, category, price, discount_price, image, description, fabric_type, available_sizes, colors, stock_count, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [p.id, p.name, p.category, p.price, p.discount_price, p.image, p.description, p.fabric_type, p.available_sizes, p.colors, p.stock_count, p.is_featured]
        );
      }
    }

    for (const s of SEED_DATA.services) {
      const sCheck = await client.query('SELECT id FROM bespoke_services WHERE name = $1', [s.name]);
      if (sCheck.rowCount === 0) {
        console.log(`Configuring Service: ${s.name}`);
        await client.query(
          'INSERT INTO bespoke_services (id, name, icon, base_price, description) VALUES ($1, $2, $3, $4, $5)',
          [s.id, s.name, s.icon, s.base_price, s.description]
        );
      }
    }

    for (const b of SEED_DATA.banners) {
      const bCheck = await client.query('SELECT id FROM banners WHERE id = $1', [b.id]);
      if (bCheck.rowCount === 0) {
        console.log(`Mounting Hero: ${b.title}`);
        await client.query(
          'INSERT INTO banners (id, title, subtitle, image_url, link_url) VALUES ($1, $2, $3, $4, $5)',
          [b.id, b.title, b.subtitle, b.image_url, b.link_url]
        );
      }
    }

    for (const n of SEED_DATA.notices) {
      const nCheck = await client.query('SELECT id FROM notices WHERE id = $1', [n.id]);
      if (nCheck.rowCount === 0) {
        await client.query('INSERT INTO notices (id, content, type, is_active) VALUES ($1, $2, $3, $4)', [n.id, n.content, n.type, n.isActive]);
      }
    }

    for (const o of SEED_DATA.offers) {
      const oCheck = await client.query('SELECT id FROM offers WHERE id = $1', [o.id]);
      if (oCheck.rowCount === 0) {
        await client.query('INSERT INTO offers (id, title, description, discount_tag, image_url, link_url) VALUES ($1, $2, $3, $4, $5, $6)', [o.id, o.title, o.description, o.discount_tag, o.image_url, o.link_url]);
      }
    }

    console.log('SUCCESS: Global Artisan Registry Synchronized.');
    client.release();
  } catch (err) {
    console.error('DATABASE INITIALIZATION WARNING:', err.message);
    console.log('Continuing without database synchronization. Verify Postgres availability.');
    // Do not exit with 1, allow the app to attempt to start so it can show errors in the UI
  } finally {
    await pool.end();
  }
}

run();