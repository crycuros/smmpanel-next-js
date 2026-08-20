-- Create ticket_reply table if it doesn't exist
CREATE TABLE IF NOT EXISTS ticket_reply (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  support VARCHAR(10) DEFAULT '1',
  message TEXT,
  readed VARCHAR(10) DEFAULT '1'
);

-- Enable RLS
ALTER TABLE ticket_reply ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read ticket replies
CREATE POLICY "Allow read access to ticket_reply" ON ticket_reply
FOR SELECT USING (true);

-- Create policy to allow anyone to insert ticket replies
CREATE POLICY "Allow insert access to ticket_reply" ON ticket_reply
FOR INSERT WITH CHECK (true);

-- Also ensure tickets table has proper RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read tickets
CREATE POLICY "Allow read access to tickets" ON tickets
FOR SELECT USING (true);

-- Create policy to allow anyone to update tickets
CREATE POLICY "Allow update access to tickets" ON tickets
FOR UPDATE USING (true);

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tickets', 'ticket_reply');
