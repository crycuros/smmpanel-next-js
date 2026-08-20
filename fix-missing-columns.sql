-- ============================================
-- FIX MISSING COLUMNS AND TABLES
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rheijhwwygedmotyjeqw/sql/new
-- ============================================

-- 1. Add missing columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_api TEXT DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS api_provider TEXT DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_description TEXT DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_refill TEXT DEFAULT 'no';
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_cancel TEXT DEFAULT 'yes';
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_name TEXT DEFAULT 'Uncategorized';
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_status TEXT DEFAULT '2';

-- 2. Add missing totp_secret to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false;

-- 3. Add missing totp_secret to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS totp_secret TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false;

-- 4. Create funds table if missing
CREATE TABLE IF NOT EXISTS funds (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(client_id),
  amount NUMERIC(21,4) DEFAULT 0,
  method TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add foreign key from orders to clients if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_client_id_fkey'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES clients(client_id);
  END IF;
END $$;

-- 6. Ensure RLS allows service_role full access on new columns
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access to services
DROP POLICY IF EXISTS "Service role full access" ON services;
CREATE POLICY "Service role full access" ON services FOR ALL USING (true) WITH CHECK (true);

-- Allow public read on services
DROP POLICY IF EXISTS "Public read access" ON services;
CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
