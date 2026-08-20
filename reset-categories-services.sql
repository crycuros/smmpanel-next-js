-- WARNING: This deletes ALL categories and services, then resets ID counters
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rheijhwwygedmotyjeqw/sql/new

-- 1. Delete all services
DELETE FROM services;

-- 2. Delete all categories
DELETE FROM categories;

-- 3. Reset sequences to start from 1
ALTER SEQUENCE services_service_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_category_id_seq RESTART WITH 1;

-- Done. Both tables are empty with IDs starting from 1 again.
