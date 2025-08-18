-- Add cleanup function to automatically delete expired demo data
CREATE OR REPLACE FUNCTION public.schedule_demo_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Delete expired demo users and their files
  WITH expired_users AS (
    DELETE FROM demo_users
    WHERE expires_at < NOW() OR is_active = false
    RETURNING id
  )
  DELETE FROM demo_files
  WHERE demo_user_id IN (SELECT id FROM expired_users);
  
  -- Clean up orphaned demo files
  DELETE FROM demo_files
  WHERE demo_user_id NOT IN (
    SELECT id FROM demo_users 
    WHERE is_active = true AND expires_at > NOW()
  );
END;
$$;