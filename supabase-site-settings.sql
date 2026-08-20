-- Create site_settings table for storing payment and site configuration
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'MND - Market Next Door',
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to site_settings" ON site_settings
    FOR SELECT USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update site_settings" ON site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert site_settings" ON site_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings if table is empty
INSERT INTO site_settings (site_name, site_description, support_email, currency, timezone)
VALUES ('MND - Market Next Door', 'Best SMM Panel in the Philippines', 'support@mndph.com', 'PHP', 'Asia/Manila')
ON CONFLICT DO NOTHING;
