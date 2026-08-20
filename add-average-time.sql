-- Add average_time column to services table (stores average completion time in minutes)
ALTER TABLE services ADD COLUMN IF NOT EXISTS average_time INTEGER DEFAULT NULL;

-- Create index for faster queries on service_id and order_status
CREATE INDEX IF NOT EXISTS idx_orders_service_status ON orders(service_id, order_status);
