-- Fix RLS policies for vehicles table to allow admin access
-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON vehicles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON vehicles;

-- Create new policies that allow admin access
CREATE POLICY "vehicles_select_policy" ON vehicles
    FOR SELECT
    USING (
        -- Allow customers to see their own vehicles
        user_id = auth.uid()
        OR
        -- Allow assessors to see all vehicles (they need to see vehicles for assessments)
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'assessor'
        )
        OR
        -- Allow admins to see all vehicles
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "vehicles_insert_policy" ON vehicles
    FOR INSERT
    WITH CHECK (
        -- Allow customers to insert their own vehicles
        user_id = auth.uid()
        OR
        -- Allow admins to insert vehicles
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "vehicles_update_policy" ON vehicles
    FOR UPDATE
    USING (
        -- Allow customers to update their own vehicles
        user_id = auth.uid()
        OR
        -- Allow admins to update all vehicles
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "vehicles_delete_policy" ON vehicles
    FOR DELETE
    USING (
        -- Allow customers to delete their own vehicles
        user_id = auth.uid()
        OR
        -- Allow admins to delete all vehicles
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );



