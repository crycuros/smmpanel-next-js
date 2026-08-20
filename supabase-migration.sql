-- ============================================
-- MND Panel - Complete Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  client_id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  admin_type TEXT DEFAULT 'user',
  password TEXT NOT NULL,
  telephone TEXT,
  balance NUMERIC(21,4) DEFAULT 0,
  spent NUMERIC(21,4) DEFAULT 0,
  balance_type TEXT DEFAULT '2',
  debit_limit NUMERIC(21,4) DEFAULT 0,
  register_date TIMESTAMPTZ DEFAULT NOW(),
  login_date TIMESTAMPTZ,
  login_ip TEXT,
  apikey TEXT,
  tel_type TEXT DEFAULT '1',
  email_type TEXT DEFAULT '1',
  client_type TEXT DEFAULT '1',
  access TEXT,
  lang TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  currency_type TEXT,
  ref_code TEXT,
  ref_by TEXT,
  change_email TEXT,
  resend_max INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  passwordreset_token TEXT,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  broadcast_id TEXT,
  role TEXT DEFAULT 'user'
);

-- ============================================
-- 2. CLIENTS TABLE (legacy, for signin compat)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  client_id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  admin_type TEXT DEFAULT '2',
  password TEXT NOT NULL,
  telephone TEXT,
  balance NUMERIC(21,4) DEFAULT 0,
  spent NUMERIC(21,4) DEFAULT 0,
  balance_type TEXT DEFAULT '2',
  debit_limit NUMERIC(21,4) DEFAULT 0,
  register_date TIMESTAMPTZ DEFAULT NOW(),
  login_date TIMESTAMPTZ,
  login_ip TEXT,
  apikey TEXT,
  tel_type TEXT DEFAULT '1',
  email_type TEXT DEFAULT '2',
  client_type TEXT DEFAULT '2',
  access TEXT,
  lang TEXT DEFAULT 'en',
  timezone NUMERIC DEFAULT 0,
  currency_type TEXT,
  ref_code TEXT,
  ref_by TEXT,
  change_email TEXT DEFAULT '2',
  resend_max INTEGER DEFAULT 3,
  currency TEXT DEFAULT '1',
  passwordreset_token TEXT,
  discount_percentage INTEGER DEFAULT 0,
  broadcast_id TEXT DEFAULT '0'
);

-- ============================================
-- 3. SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  service_id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT DEFAULT '2',
  api_serviceid INTEGER,
  api_id INTEGER DEFAULT 0,
  service_rate NUMERIC(21,4) DEFAULT 0,
  service_price NUMERIC(21,4) DEFAULT 0,
  service_profit NUMERIC(10,2) DEFAULT 20,
  min_order INTEGER DEFAULT 1,
  max_order INTEGER DEFAULT 1000,
  avg_time INTEGER DEFAULT 0,
  service_desc TEXT DEFAULT '',
  service_cancel INTEGER DEFAULT 1,
  service_refill INTEGER DEFAULT 0,
  service_dripfeed INTEGER DEFAULT 0,
  service_secret TEXT DEFAULT '2',
  service_status TEXT DEFAULT '2',
  service_deleted TEXT DEFAULT '0',
  service_mode TEXT DEFAULT '1'
);

-- ============================================
-- 4. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  category_name TEXT NOT NULL,
  category_name_lang TEXT,
  category_line NUMERIC DEFAULT 0,
  category_type TEXT DEFAULT '2',
  category_secret TEXT DEFAULT '2',
  category_icon TEXT DEFAULT '{}',
  is_refill TEXT DEFAULT '1',
  category_deleted TEXT DEFAULT '0'
);

-- ============================================
-- 5. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  api_orderid INTEGER DEFAULT 0,
  order_error TEXT DEFAULT '',
  order_detail TEXT,
  order_api INTEGER DEFAULT 0,
  api_serviceid INTEGER DEFAULT 0,
  api_charge NUMERIC(10,2) DEFAULT 0,
  api_currencycharge NUMERIC(10,2) DEFAULT 1,
  order_profit NUMERIC(10,2) DEFAULT 0,
  order_quantity NUMERIC NOT NULL,
  order_extras TEXT DEFAULT '',
  order_charge NUMERIC(10,2) NOT NULL,
  dripfeed TEXT DEFAULT '1',
  dripfeed_id NUMERIC DEFAULT 0,
  subscriptions_id NUMERIC DEFAULT 0,
  subscriptions_type TEXT DEFAULT '1',
  dripfeed_totalcharges NUMERIC,
  dripfeed_runs NUMERIC,
  dripfeed_delivery NUMERIC DEFAULT 0,
  dripfeed_interval NUMERIC,
  dripfeed_totalquantity NUMERIC,
  dripfeed_status TEXT DEFAULT 'active',
  order_url TEXT NOT NULL,
  order_start NUMERIC DEFAULT 0,
  order_finish NUMERIC DEFAULT 0,
  order_remains NUMERIC DEFAULT 0,
  order_create TIMESTAMPTZ DEFAULT NOW(),
  order_status TEXT DEFAULT 'pending',
  subscriptions_status TEXT DEFAULT 'active',
  subscriptions_username TEXT,
  subscriptions_posts NUMERIC,
  subscriptions_delivery NUMERIC DEFAULT 0,
  subscriptions_delay NUMERIC,
  subscriptions_min NUMERIC,
  subscriptions_max NUMERIC,
  subscriptions_expiry DATE,
  last_check TIMESTAMPTZ DEFAULT NOW(),
  order_where TEXT DEFAULT 'site',
  refill_status TEXT DEFAULT 'Pending',
  is_refill TEXT DEFAULT '1',
  refill TEXT DEFAULT '1',
  cancelbutton TEXT DEFAULT '1',
  show_refill TEXT DEFAULT 'true',
  api_refillid NUMERIC DEFAULT 0,
  avg_done TEXT DEFAULT '1',
  order_increase INTEGER DEFAULT 0,
  completion_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ
);

-- ============================================
-- 6. SERVICE_API TABLE (SMM providers)
-- ============================================
CREATE TABLE IF NOT EXISTS service_api (
  id SERIAL PRIMARY KEY,
  api_name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_currency TEXT DEFAULT 'USD',
  api_status TEXT DEFAULT '2',
  api_type TEXT DEFAULT '1',
  api_profit NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. SITE_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT DEFAULT 'MND - Marketer Next Door',
  site_description TEXT DEFAULT 'Best SMM Panel in the Philippines',
  support_email TEXT DEFAULT 'support@mndph.com',
  currency TEXT DEFAULT 'PHP',
  timezone TEXT DEFAULT 'Asia/Manila',
  maintenance_mode BOOLEAN DEFAULT false,
  registration_enabled BOOLEAN DEFAULT true,
  email_verification BOOLEAN DEFAULT false,
  telegram TEXT DEFAULT '',
  discord TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  binance_pay TEXT DEFAULT '',
  binance_id TEXT DEFAULT '',
  gcash_number TEXT DEFAULT '',
  forex_rates JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. TICKET_REPLY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_reply (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  time TIMESTAMPTZ DEFAULT NOW(),
  support TEXT DEFAULT '1',
  message TEXT,
  readed TEXT DEFAULT '1'
);

-- ============================================
-- 10. ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  admin_id SERIAL PRIMARY KEY,
  admin_type TEXT DEFAULT '2',
  admin_name TEXT,
  admin_email TEXT,
  username TEXT UNIQUE,
  password TEXT NOT NULL,
  telephone TEXT,
  register_date TIMESTAMPTZ DEFAULT NOW(),
  login_date TIMESTAMPTZ,
  login_ip TEXT,
  client_type TEXT DEFAULT '2',
  access TEXT DEFAULT '{}',
  mode TEXT DEFAULT 'dark',
  two_factor TEXT DEFAULT '0',
  two_factor_secret_key TEXT,
  ip_type INTEGER DEFAULT 1,
  ip TEXT
);

-- ============================================
-- RPC FUNCTIONS (atomic balance operations)
-- ============================================

-- Deduct balance atomically
CREATE OR REPLACE FUNCTION deduct_balance(user_id INT, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET balance = balance - amount,
      spent = spent + amount
  WHERE client_id = user_id AND balance >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or user not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refund balance atomically
CREATE OR REPLACE FUNCTION refund_balance(user_id INT, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount,
      spent = spent - amount
  WHERE client_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_reply ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_api ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow service_role (backend) full access
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access clients" ON clients
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access services" ON services
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access service_api" ON service_api
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access tickets" ON tickets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access ticket_reply" ON ticket_reply
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');

-- Public read access for services, categories, site_settings
CREATE POLICY "Public read services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default admin (password: admin123)
INSERT INTO admins (admin_name, admin_email, username, password, admin_type, access, mode)
VALUES (
  'Admin',
  'admin@mnd.com',
  'admin',
  'admin123',
  '3',
  '{"admin_access":1,"users":1,"services":1,"orders":1,"settings":1,"super_admin":1}',
  'dark'
) ON CONFLICT (username) DO NOTHING;

-- Default site settings
INSERT INTO site_settings (site_name, site_description, support_email, currency, timezone)
VALUES ('MND - Marketer Next Door', 'Best SMM Panel in the Philippines', 'support@mndph.com', 'PHP', 'Asia/Manila')
ON CONFLICT DO NOTHING;

-- Default category
INSERT INTO categories (category_name, category_line, category_type, category_icon)
VALUES ('Facebook Reactions', 1, '2', '{"icon_type":"icon","icon_class":"fas fa-anchor"}')
ON CONFLICT DO NOTHING;

-- Default SMM API provider
INSERT INTO service_api (api_name, api_url, api_key, api_currency, api_status)
VALUES ('WeBoostPH', 'https://weboostph.biz/api/v2', 'ba0bdd77f025b1fc19b321ecaf0acf67', 'PHP', '2')
ON CONFLICT DO NOTHING;

-- ============================================
-- DONE! 
-- After running this, get your credentials:
-- Settings > API > Project URL & anon key
-- ============================================
