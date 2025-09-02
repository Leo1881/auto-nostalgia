-- Create 9 assessor accounts for all South African provinces
-- This script will create assessor profiles with realistic data

-- First, let's create the assessor accounts with auth.users (you'll need to create these in Supabase Auth first)
-- Then we'll insert the corresponding profiles

-- Note: You'll need to create these users in Supabase Auth first, then update the user IDs below
-- with the actual UUIDs from the auth.users table

-- Example structure (replace the UUIDs with actual auth user IDs):
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  phone,
  province,
  city,
  created_at
) VALUES 
-- Western Cape
(
  '00000000-0000-0000-0000-000000000001', -- Replace with actual auth user ID
  'assessor.westerncape@autonostalgia.co.za',
  'John Smith',
  'assessor',
  '+27 21 555 0101',
  'Western Cape',
  'Cape Town',
  NOW()
),
-- Eastern Cape
(
  '00000000-0000-0000-0000-000000000002', -- Replace with actual auth user ID
  'assessor.easterncape@autonostalgia.co.za',
  'Sarah Johnson',
  'assessor',
  '+27 40 555 0202',
  'Eastern Cape',
  'Port Elizabeth',
  NOW()
),
-- Northern Cape
(
  '00000000-0000-0000-0000-000000000003', -- Replace with actual auth user ID
  'assessor.northerncape@autonostalgia.co.za',
  'Michael Brown',
  'assessor',
  '+27 53 555 0303',
  'Northern Cape',
  'Kimberley',
  NOW()
),
-- Free State
(
  '00000000-0000-0000-0000-000000000004', -- Replace with actual auth user ID
  'assessor.freestate@autonostalgia.co.za',
  'Lisa Davis',
  'assessor',
  '+27 51 555 0404',
  'Free State',
  'Bloemfontein',
  NOW()
),
-- KwaZulu-Natal
(
  '00000000-0000-0000-0000-000000000005', -- Replace with actual auth user ID
  'assessor.kwazulunatal@autonostalgia.co.za',
  'David Wilson',
  'assessor',
  '+27 31 555 0505',
  'KwaZulu-Natal',
  'Durban',
  NOW()
),
-- North West
(
  '00000000-0000-0000-0000-000000000006', -- Replace with actual auth user ID
  'assessor.northwest@autonostalgia.co.za',
  'Emma Taylor',
  'assessor',
  '+27 14 555 0606',
  'North West',
  'Rustenburg',
  NOW()
),
-- Gauteng
(
  '00000000-0000-0000-0000-000000000007', -- Replace with actual auth user ID
  'assessor.gauteng@autonostalgia.co.za',
  'Robert Anderson',
  'assessor',
  '+27 11 555 0707',
  'Gauteng',
  'Johannesburg',
  NOW()
),
-- Mpumalanga
(
  '00000000-0000-0000-0000-000000000008', -- Replace with actual auth user ID
  'assessor.mpumalanga@autonostalgia.co.za',
  'Jennifer Martinez',
  'assessor',
  '+27 13 555 0808',
  'Mpumalanga',
  'Nelspruit',
  NOW()
),
-- Limpopo
(
  '00000000-0000-0000-0000-000000000009', -- Replace with actual auth user ID
  'assessor.limpopo@autonostalgia.co.za',
  'Thomas Garcia',
  'assessor',
  '+27 15 555 0909',
  'Limpopo',
  'Polokwane',
  NOW()
);

-- Alternative: If you want to create them without auth users first (for testing):
-- You can run this to create profiles with placeholder UUIDs
-- Then create the auth users later and update the IDs

-- INSERT INTO profiles (
--   id,
--   email,
--   full_name,
--   role,
--   phone,
--   province,
--   city,
--   created_at
-- ) VALUES 
-- ('11111111-1111-1111-1111-111111111111', 'assessor.westerncape@autonostalgia.co.za', 'John Smith', 'assessor', '+27 21 555 0101', 'Western Cape', 'Cape Town', NOW()),
-- ('22222222-2222-2222-2222-222222222222', 'assessor.easterncape@autonostalgia.co.za', 'Sarah Johnson', 'assessor', '+27 40 555 0202', 'Eastern Cape', 'Port Elizabeth', NOW()),
-- ('33333333-3333-3333-3333-333333333333', 'assessor.northerncape@autonostalgia.co.za', 'Michael Brown', 'assessor', '+27 53 555 0303', 'Northern Cape', 'Kimberley', NOW()),
-- ('44444444-4444-4444-4444-444444444444', 'assessor.freestate@autonostalgia.co.za', 'Lisa Davis', 'assessor', '+27 51 555 0404', 'Free State', 'Bloemfontein', NOW()),
-- ('55555555-5555-5555-5555-555555555555', 'assessor.kwazulunatal@autonostalgia.co.za', 'David Wilson', 'assessor', '+27 31 555 0505', 'KwaZulu-Natal', 'Durban', NOW()),
-- ('66666666-6666-6666-6666-666666666666', 'assessor.northwest@autonostalgia.co.za', 'Emma Taylor', 'assessor', '+27 14 555 0606', 'North West', 'Rustenburg', NOW()),
-- ('77777777-7777-7777-7777-777777777777', 'assessor.gauteng@autonostalgia.co.za', 'Robert Anderson', 'assessor', '+27 11 555 0707', 'Gauteng', 'Johannesburg', NOW()),
-- ('88888888-8888-8888-8888-888888888888', 'assessor.mpumalanga@autonostalgia.co.za', 'Jennifer Martinez', 'assessor', '+27 13 555 0808', 'Mpumalanga', 'Nelspruit', NOW()),
-- ('99999999-9999-9999-9999-999999999999', 'assessor.limpopo@autonostalgia.co.za', 'Thomas Garcia', 'assessor', '+27 15 555 0909', 'Limpopo', 'Polokwane', NOW());
