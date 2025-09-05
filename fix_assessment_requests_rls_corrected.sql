-- Fix RLS policies for assessment_requests table (corrected version)

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'assessment_requests';

-- Drop ALL existing policies (if any)
DROP POLICY IF EXISTS "customers_view_own_requests" ON assessment_requests;
DROP POLICY IF EXISTS "assessors_view_assigned_requests" ON assessment_requests;
DROP POLICY IF EXISTS "admins_view_all_requests" ON assessment_requests;
DROP POLICY IF EXISTS "customers_insert_own_requests" ON assessment_requests;
DROP POLICY IF EXISTS "assessors_update_assigned_requests" ON assessment_requests;
DROP POLICY IF EXISTS "admins_update_any_request" ON assessment_requests;
DROP POLICY IF EXISTS "admins_delete_any_request" ON assessment_requests;

-- Create new policies that allow proper access

-- 1. Customers can view their own assessment requests
CREATE POLICY "customers_view_own_requests" ON assessment_requests
    FOR SELECT
    USING (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'customer'
        )
    );

-- 2. Assessors can view assessment requests assigned to them
CREATE POLICY "assessors_view_assigned_requests" ON assessment_requests
    FOR SELECT
    USING (
        assigned_assessor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'assessor'
        )
    );

-- 3. Admins can view ALL assessment requests
CREATE POLICY "admins_view_all_requests" ON assessment_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 4. Customers can insert their own assessment requests
CREATE POLICY "customers_insert_own_requests" ON assessment_requests
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'customer'
        )
    );

-- 5. Assessors can update assessment requests assigned to them
CREATE POLICY "assessors_update_assigned_requests" ON assessment_requests
    FOR UPDATE
    USING (
        assigned_assessor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'assessor'
        )
    );

-- 4. Admins can update any assessment request
CREATE POLICY "admins_update_any_request" ON assessment_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 5. Admins can delete any assessment request
CREATE POLICY "admins_delete_any_request" ON assessment_requests
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
WHERE tablename = 'assessment_requests'
ORDER BY policyname;
