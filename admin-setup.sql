-- ============================================
-- ADMIN ACCOUNT SETUP (Run in Supabase SQL Editor)
-- ============================================

-- Add totp_secret column if not exists
-- ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255);

-- Insert admin users with hashed passwords
-- jay@nexofame.com / Jessiepinkman@09
-- chardi@nexofame.com / Bosschito09.

INSERT INTO users (email, username, password, admin_type) VALUES 
('jay@nexofame.com', 'jay', '$2b$10$pEE6Hg8aYf3WroaaXvupOO0h5WoOA7arOfwtyn22ocQIGlmc.CyL6', 'admin'),
('chardi@nexofame.com', 'chardi', '$2b$10$7x.pF6FFD.T7Rbp82SxG6O0bCEjEVJ9PuBT5VVcWHKyCQoKcphfK.', 'admin')
ON DUPLICATE KEY UPDATE admin_type = 'admin';

-- ============================================
-- 2FA SETUP (Google Authenticator)
-- ============================================
-- To enable 2FA for admin:
-- 1. Add totp_secret column: ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255);
-- 2. Generate secret and update user in Supabase
-- 3. Admin scans QR code in Google Authenticator app
-- ============================================
