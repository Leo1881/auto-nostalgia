-- Populate address fields for assessor after consolidation
-- Run this in your Supabase SQL editor

-- Update the assessor's address information
-- Based on their location being "Limpopo", we'll use Polokwane as the city
UPDATE profiles 
SET 
  address = '123 Main Street',
  city = 'Polokwane',
  province = 'Limpopo',
  zip_code = '0700',
  country = 'South Africa',
  updated_at = NOW()
WHERE id = '0290a8df-e395-4347-a295-c3c375f6de5d'
AND role = 'assessor';

-- Verify the update
SELECT 
  id,
  full_name,
  email,
  role,
  phone,
  address,
  city,
  province,
  zip_code,
  country,
  experience,
  contact_method,
  assessor_status
FROM profiles 
WHERE id = '0290a8df-e395-4347-a295-c3c375f6de5d';
