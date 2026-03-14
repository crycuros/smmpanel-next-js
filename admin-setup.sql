-- ============================================
-- ADMIN ACCOUNT SETUP (Run in Supabase SQL Editor - PostgreSQL)
-- ============================================

-- Insert admin users with hashed passwords
-- jay@nexofame.com / Jessiepinkman@09
-- chardi@nexofame.com / Bosschito09.

INSERT INTO users (email, username, password, admin_type) VALUES 
('jay@nexofame.com', 'jay', '$2b$10$pEE6Hg8aYf3WroaaXvupOO0h5WoOA7arOfwtyn22ocQIGlmc.CyL6', 'admin'),
('chardi@nexofame.com', 'chardi', '$2b$10$7x.pF6FFD.T7Rbp82SxG6O0bCEjEVJ9PuBT5VVcWHKyCQoKcphfK.', 'admin')
ON CONFLICT (email) DO UPDATE SET admin_type = 'admin';
