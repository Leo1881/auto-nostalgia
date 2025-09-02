-- Add Admin User to Profiles Table
-- This script adds a new admin user with the specified email address

-- Insert the admin user with auto-generated UUID
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  phone,
  province,
  city,
  address,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- Auto-generate UUID
  'barrymotious26@gmail.com',
  'Barry Oliphant',
  'admin',
  NULL, -- Phone can be added later
  NULL, -- Province can be added later
  NULL, -- City can be added later
  NULL, -- Address can be added later
  NOW(),
  NOW()
);

-- Verify the insertion
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE email = 'barrymotious26@gmail.com';
