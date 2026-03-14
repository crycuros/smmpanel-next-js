


-- =====================================================
-- NEW AND REQUIRED - Run this to add new columns
-- =====================================================

-- Add service_refill column to services table (if not exists)
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_refill VARCHAR(20) DEFAULT 'no';

-- For existing databases, you may need to run:
-- ALTER TABLE services ADD COLUMN service_refill VARCHAR(20) DEFAULT 'no';
