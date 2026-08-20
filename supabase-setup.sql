-- Add columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS api_serviceid INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_profit NUMERIC(10,2) DEFAULT 20;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  api_orderid INTEGER DEFAULT 0,
  order_error TEXT DEFAULT '',
  order_detail TEXT,
  api_serviceid INTEGER DEFAULT 0,
  api_charge NUMERIC(10,2) DEFAULT 0,
  api_currencycharge NUMERIC(10,2) DEFAULT 1,
  order_profit NUMERIC(10,2) NOT NULL,
  order_quantity INTEGER NOT NULL,
  order_extras TEXT DEFAULT '',
  order_charge NUMERIC(10,2) NOT NULL,
  order_url TEXT NOT NULL,
  order_start INTEGER DEFAULT 0,
  order_finish INTEGER DEFAULT 0,
  order_remains INTEGER DEFAULT 0,
  order_create TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_status VARCHAR(50) DEFAULT 'pending',
  order_where VARCHAR(10) DEFAULT 'site',
  refill_status VARCHAR(20) DEFAULT 'Pending',
  is_refill VARCHAR(5) DEFAULT '1',
  order_increase INTEGER DEFAULT 0,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
