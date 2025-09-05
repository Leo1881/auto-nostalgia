-- Fix RLS policies for vehicles table to allow admins to see all data

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'vehicles';

-- Drop ALL existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can update any vehicle" ON vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can delete any vehicle" ON vehicles;

-- Create new policies that allow proper access

-- 1. Users can view their own vehicles
CREATE POLICY "users_view_own_vehicles" ON vehicles
    FOR SELECT
    USING (
        user_id = auth.uid()
    );

-- 2. Admins can view ALL vehicles
CREATE POLICY "admins_view_all_vehicles" ON vehicles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 3. Users can insert their own vehicles
CREATE POLICY "users_insert_own_vehicles" ON vehicles
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

-- 4. Users can update their own vehicles
CREATE POLICY "users_update_own_vehicles" ON vehicles
    FOR UPDATE
    USING (
        user_id = auth.uid()
    );

-- 5. Admins can update any vehicle
CREATE POLICY "admins_update_any_vehicle" ON vehicles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 6. Users can delete their own vehicles
CREATE POLICY "users_delete_own_vehicles" ON vehicles
    FOR DELETE
    USING (
        user_id = auth.uid()
    );

-- 7. Admins can delete any vehicle
CREATE POLICY "admins_delete_any_vehicle" ON vehicles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'vehicles'
ORDER BY policyname;
