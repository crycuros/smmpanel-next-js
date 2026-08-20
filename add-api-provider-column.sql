-- Add api_provider column to services table for multi-provider support
ALTER TABLE services ADD COLUMN IF NOT EXISTS api_provider TEXT;
