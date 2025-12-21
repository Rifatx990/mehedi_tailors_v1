-- Mehedi Tailors & Fabrics PostgreSQL Schema
-- Version 8.0.0-PERSISTENT

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'worker', 'customer');
CREATE TYPE coupon_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE notice_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'delivered');
CREATE TYPE gift_card_status AS ENUM ('active', 'used', 'expired');

-- Users table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  measurements JSONB DEFAULT '[]'::jsonb,
  role user_role NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  experience VARCHAR(255),
  join_date VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  image VARCHAR(500),
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  fabric_type VARCHAR(100),
  available_sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent DECIMAL(5, 2) NOT NULL,
  status coupon_status DEFAULT 'active',
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notices table
CREATE TABLE notices (
  id VARCHAR(50) PRIMARY KEY,
  content TEXT NOT NULL,
  type notice_type DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Offers table
CREATE TABLE offers (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_tag VARCHAR(50),
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  items JSONB DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10, 2),
  status order_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gift Cards table
CREATE TABLE gift_cards (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  denomination DECIMAL(10, 2) NOT NULL,
  status gift_card_status DEFAULT 'active',
  purchased_by VARCHAR(50) REFERENCES users(id),
  purchased_at TIMESTAMP DEFAULT NOW(),
  expired_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bespoke Services table
CREATE TABLE bespoke_services (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fabrics table
CREATE TABLE fabrics (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  color VARCHAR(100),
  price_per_meter DECIMAL(10, 2),
  stock_quantity DECIMAL(10, 2),
  supplier VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Material Requests table
CREATE TABLE material_requests (
  id VARCHAR(50) PRIMARY KEY,
  worker_id VARCHAR(50) REFERENCES users(id),
  fabric_id VARCHAR(50) REFERENCES fabrics(id),
  quantity DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Banners table
CREATE TABLE banners (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255),
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer Emails table
CREATE TABLE customer_emails (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System Config table
CREATE TABLE system_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255),
  site_logo VARCHAR(500),
  document_logo VARCHAR(500),
  db_version VARCHAR(50),
  gift_card_denominations JSONB DEFAULT '[]'::jsonb,
  gift_cards_enabled BOOLEAN DEFAULT true,
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_notices_active ON notices(is_active);

-- Grant permissions (if needed for Replit PostgreSQL)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
