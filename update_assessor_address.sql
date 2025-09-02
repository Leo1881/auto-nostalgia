-- Update assessor address information
-- Run this in your Supabase SQL editor

-- Update the assessor profile with address information
-- Based on the assessor data, they are in Limpopo
UPDATE profiles 
SET 
  phone = '0987654321',
  address = '123 Main Street',
  city = 'Polokwane',
  province = 'Limpopo',
  zip_code = '0700',
  country = 'South Africa',
  updated_at = NOW()
WHERE id = '0290a8df-e395-4347-a295-c3c375f6de5d';

-- Verify the update
SELECT 
  id,
  full_name,
  phone,
  address,
  city,
  province,
  zip_code,
  country
FROM profiles 
WHERE id = '0290a8df-e395-4347-a295-c3c375f6de5d';
