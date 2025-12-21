-- Mehedi Tailors & Fabrics - Data Seeders
-- Default Credentials and Bootstrap Data

-- Insert default users with hashed passwords
-- Admin: admin@meheditailors.com / admin123
-- Worker: worker@meheditailors.com / worker123
-- Password hashes are bcrypt format (in production use proper hashing)

INSERT INTO users (id, name, email, phone, address, role, password_hash) VALUES
('adm-001', 'System Admin', 'admin@meheditailors.com', '+8801720267213', 'Atelier Savar', 'admin', '$2b$10$YourHashedPasswordHere'),
('wrk-001', 'Kabir Artisan', 'worker@meheditailors.com', '+8801720267214', 'Staff Quarters, Savar', 'worker', '$2b$10$YourHashedPasswordHere')
ON CONFLICT (id) DO NOTHING;

-- Insert product categories
INSERT INTO categories (name) VALUES
('Men'),
('Women'),
('Kids'),
('Fabrics'),
('Custom Tailoring')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, name, category, price, discount_price, image, description, fabric_type, available_sizes, colors, in_stock, stock_count, is_featured) VALUES
('p1', 'Premium Silk Panjabi', 'Men', 4500, 3800, 'https://picsum.photos/seed/panjabi/600/800', 'Exquisite silk panjabi with hand-crafted embroidery.', 'Silk', '["S", "M", "L", "XL"]', '["Cream", "Deep Blue"]', true, 15, true),
('p2', 'Italian Cotton Fabric', 'Fabrics', 1200, NULL, 'https://picsum.photos/seed/fabric1/600/800', 'High-quality breathable Italian cotton.', 'Cotton', '["Per Meter"]', '["Navy"]', true, 50, true)
ON CONFLICT (id) DO NOTHING;

-- Insert coupons
INSERT INTO coupons (id, code, discount_percent, status, usage_limit, usage_count) VALUES
('c1', 'EID2025', 15, 'active', 100, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert notices
INSERT INTO notices (id, content, type, is_active) VALUES
('n1', 'Welcome to the artisan portal. Eid commissions are now open with guaranteed delivery.', 'info', true)
ON CONFLICT (id) DO NOTHING;

-- Insert offers
INSERT INTO offers (id, title, description, discount_tag, image_url, link_url, is_active) VALUES
('o1', 'Bespoke Suiting Package', '20% off on all formal business suits throughout this month.', '20% OFF', 'https://images.unsplash.com/photo-1594932224828-b4b059b6f6f9?q=80&w=2080&auto=format&fit=crop', '/shop', true)
ON CONFLICT (id) DO NOTHING;

-- Insert bespoke services
INSERT INTO bespoke_services (id, name, icon, base_price, description, is_active) VALUES
('s1', 'Shirt', '👔', 1200, 'Precision fitted formal/casual shirts.', true),
('s2', 'Suit', '🧥', 15000, 'Full three-piece bespoke experience.', true),
('s3', 'Panjabi', '🕌', 2500, 'Traditional craftsmanship meet modern fit.', true)
ON CONFLICT (id) DO NOTHING;

-- Insert system configuration
INSERT INTO system_config (id, site_name, site_logo, document_logo, db_version, gift_card_denominations, gift_cards_enabled, smtp_host, smtp_port, is_enabled) 
VALUES (1, 'Mehedi Tailors & Fabrics', 'https://i.imgur.com/8H9IeM5.png', 'https://i.imgur.com/8H9IeM5.png', '8.0.0-PERSISTENT', '[2000, 5000, 10000, 25000]', true, 'smtp.gmail.com', 465, true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active);
