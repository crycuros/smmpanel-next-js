-- Delete all categories (and optionally services)
-- Note: Deleting categories may fail if there are services linked to them
-- Use the second query to delete all services first, then categories

-- Option 1: Delete all categories only (will fail if services exist)
DELETE FROM categories;

-- Option 2: Delete all services first, then categories
-- DELETE FROM services;
-- DELETE FROM categories;
