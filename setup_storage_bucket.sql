-- Setup Supabase Storage bucket for assessment reports
-- Run this in your Supabase SQL editor

-- Create storage bucket for assessment reports
-- Note: You'll need to create this bucket manually in the Supabase Dashboard
-- Go to Storage > Create a new bucket
-- Bucket name: reports
-- Public bucket: Yes (so reports can be downloaded)
-- File size limit: 50MB (should be enough for PDFs)

-- Set up RLS policies for the storage bucket
-- This allows authenticated users to upload and download files

-- Policy for uploading files (assessors and admins only)
CREATE POLICY "Assessors and admins can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('assessor', 'admin')
    )
  );

-- Policy for downloading files (anyone with the URL can download)
CREATE POLICY "Anyone can download files" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');

-- Policy for updating files (assessors and admins only)
CREATE POLICY "Assessors and admins can update files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('assessor', 'admin')
    )
  );

-- Policy for deleting files (assessors and admins only)
CREATE POLICY "Assessors and admins can delete files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('assessor', 'admin')
    )
  );

-- Verify the policies were created
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
