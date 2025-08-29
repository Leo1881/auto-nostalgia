-- Check vehicles table and specific vehicle data
-- Run this in your Supabase SQL editor

-- Check if the specific vehicle exists
SELECT * FROM vehicles WHERE id = 'c1ae6ef8-50e3-42ff-96c9-5e9af2fc6bb7';

-- Check all vehicles in the table
SELECT id, year, make, model, registration_number FROM vehicles LIMIT 10;

-- Check the structure of the vehicles table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
ORDER BY ordinal_position;

-- Check if there are any vehicles at all
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- Check RLS policies on vehicles table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'vehicles';
