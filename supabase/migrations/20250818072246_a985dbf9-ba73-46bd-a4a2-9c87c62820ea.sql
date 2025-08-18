-- Tighten RLS on files and folders by removing zero-UUID exceptions
-- This migration recreates strict owner-only policies to prevent public access

-- Files table policies
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can create their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

CREATE POLICY "Users can view their own files"
ON public.files
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own files"
ON public.files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
ON public.files
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
ON public.files
FOR DELETE
USING (auth.uid() = user_id);

-- Folders table policies
DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;

CREATE POLICY "Users can view their own folders"
ON public.folders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
ON public.folders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
ON public.folders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
ON public.folders
FOR DELETE
USING (auth.uid() = user_id);

-- Note: Any rows with user_id = '00000000-0000-0000-0000-000000000000' will no longer be readable via client keys.