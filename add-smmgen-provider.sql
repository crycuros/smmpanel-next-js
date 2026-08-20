-- Insert SMMGen as a provider in service_api table
-- Run this AFTER you register on smmgen.com and get your API key
-- Replace 'YOUR_SMMGEN_API_KEY' with your actual key from https://my.smmgen.com → Account → API Key

-- First, remove any existing smmgen entry to avoid duplicates
DELETE FROM service_api WHERE api_name = 'smmgen';

-- Then insert the new one
INSERT INTO service_api (api_name, api_url, api_key, api_currency, api_status, api_type, api_profit)
VALUES (
  'smmgen',
  'https://my.smmgen.com/api/v2',
  '187121485b0e05ddd39b23a993ab415c',  -- API key
  'USD',
  '2',   -- active
  '1',   -- default type
  20     -- 20% default markup
);
