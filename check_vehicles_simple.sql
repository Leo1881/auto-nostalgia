-- Check if vehicles table has RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'vehicles';

-- Check vehicles table policies
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'vehicles';



