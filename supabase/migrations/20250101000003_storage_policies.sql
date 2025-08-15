-- Drop existing storage policies for user-files bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create storage policies for user-files bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-files' AND 
  (auth.uid() IS NOT NULL OR auth.role() = 'anon')
);

-- Allow users to view their own files
CREATE POLICY "Allow authenticated downloads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-files' AND 
  (auth.uid() IS NOT NULL OR auth.role() = 'anon')
);

-- Allow users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-files' AND 
  (auth.uid() IS NOT NULL OR auth.role() = 'anon')
);

-- Allow users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-files' AND 
  (auth.uid() IS NOT NULL OR auth.role() = 'anon')
);
