-- Function to deduct balance atomically
CREATE OR REPLACE FUNCTION deduct_balance(user_id INT, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET balance = balance - amount,
      spent = spent + amount
  WHERE client_id = user_id AND balance >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or user not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refund balance atomically
CREATE OR REPLACE FUNCTION refund_balance(user_id INT, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount,
      spent = spent - amount
  WHERE client_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS is enabled on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (example)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE email = auth.email()));

-- Add role column if it doesn't exist (to avoid schema mismatches)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;
