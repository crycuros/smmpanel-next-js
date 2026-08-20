-- ============================================
-- FIX FOREIGN KEYS FOR POSTGREST JOINS
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rheijhwwygedmotyjeqw/sql/new
-- ============================================

-- 1. Add foreign key: orders.client_id → clients.client_id (needed for PostgREST joins)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_client_id_fkey'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES clients(client_id);
  END IF;
END $$;

-- 2. Fix funds table: add foreign key user_id → clients.client_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'funds_user_id_fkey'
  ) THEN
    ALTER TABLE funds ADD CONSTRAINT funds_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES clients(client_id);
  END IF;
END $$;

-- 3. Add RLS policies for clients (allow anon read)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read" ON clients;
CREATE POLICY "Allow anon read" ON clients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access" ON clients;
CREATE POLICY "Service role full access" ON clients FOR ALL USING (true) WITH CHECK (true);

-- 4. Add RLS policies for orders (allow anon read)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read" ON orders;
CREATE POLICY "Allow anon read" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access" ON orders;
CREATE POLICY "Service role full access" ON orders FOR ALL USING (true) WITH CHECK (true);

-- 5. Add RLS policies for funds (allow anon read)
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read" ON funds;
CREATE POLICY "Allow anon read" ON funds FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access" ON funds;
CREATE POLICY "Service role full access" ON funds FOR ALL USING (true) WITH CHECK (true);
