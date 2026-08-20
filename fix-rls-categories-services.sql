-- Fix RLS policies: allow anon (client-side) full access to categories and services
-- The admin panel is already protected by its own auth check
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/rheijhwwygedmotyjeqw/sql/new

-- Categories: allow full anon access (SELECT already works, add INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Anon full access categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);

-- Services: allow full anon access (SELECT already works, add INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Public read services" ON services;
CREATE POLICY "Public read services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Anon full access services" ON services
  FOR ALL USING (true) WITH CHECK (true);
