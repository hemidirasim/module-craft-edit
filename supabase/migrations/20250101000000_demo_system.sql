-- Demo istifadəçilər üçün cədvəl
CREATE TABLE IF NOT EXISTS demo_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN DEFAULT true
);

-- Demo fayllar üçün cədvəl
CREATE TABLE IF NOT EXISTS demo_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_user_id UUID REFERENCES demo_users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  public_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo istifadəçi yaratma funksiyası
CREATE OR REPLACE FUNCTION create_demo_user()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id TEXT;
  demo_user_id UUID;
BEGIN
  -- Unikal session ID yarat
  session_id := 'demo_' || gen_random_uuid()::text;
  
  -- Demo istifadəçi yarat
  INSERT INTO demo_users (session_id, expires_at)
  VALUES (session_id, NOW() + INTERVAL '24 hours')
  RETURNING id INTO demo_user_id;
  
  RETURN session_id;
END;
$$;

-- Demo fayl əlavə etmə funksiyası
CREATE OR REPLACE FUNCTION add_demo_file(
  p_session_id TEXT,
  p_file_name TEXT,
  p_file_type TEXT,
  p_file_size INTEGER,
  p_public_url TEXT,
  p_storage_path TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_user_id UUID;
  file_id UUID;
BEGIN
  -- Demo istifadəçini tap
  SELECT id INTO demo_user_id
  FROM demo_users
  WHERE session_id = p_session_id AND is_active = true AND expires_at > NOW();
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user not found or expired';
  END IF;
  
  -- Demo fayl əlavə et
  INSERT INTO demo_files (
    demo_user_id,
    file_name,
    file_type,
    file_size,
    public_url,
    storage_path
  )
  VALUES (
    demo_user_id,
    p_file_name,
    p_file_type,
    p_file_size,
    p_public_url,
    p_storage_path
  )
  RETURNING id INTO file_id;
  
  RETURN file_id;
END;
$$;

-- Köhnə demo məlumatları təmizləmə funksiyası
CREATE OR REPLACE FUNCTION cleanup_expired_demo_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Köhnə demo istifadəçiləri və onların fayllarını sil
  WITH deleted_users AS (
    DELETE FROM demo_users
    WHERE expires_at < NOW() OR is_active = false
    RETURNING id
  )
  DELETE FROM demo_files
  WHERE demo_user_id IN (SELECT id FROM deleted_users);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Avtomatik təmizləmə üçün cron job (hər saat)
SELECT cron.schedule(
  'cleanup-demo-data',
  '0 * * * *', -- hər saat
  'SELECT cleanup_expired_demo_data();'
);

-- Demo istifadəçinin fayllarını almaq üçün funksiya
CREATE OR REPLACE FUNCTION get_demo_files(p_session_id TEXT)
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  public_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    df.id,
    df.file_name,
    df.file_type,
    df.file_size,
    df.public_url,
    df.created_at
  FROM demo_files df
  JOIN demo_users du ON df.demo_user_id = du.id
  WHERE du.session_id = p_session_id 
    AND du.is_active = true 
    AND du.expires_at > NOW()
  ORDER BY df.created_at DESC;
END;
$$;

-- RLS (Row Level Security) aktivləşdir
ALTER TABLE demo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_files ENABLE ROW LEVEL SECURITY;

-- Demo istifadəçilər üçün policy
CREATE POLICY "Demo users can view their own data" ON demo_users
  FOR SELECT USING (true);

CREATE POLICY "Demo users can insert their own data" ON demo_users
  FOR INSERT WITH CHECK (true);

-- Demo fayllar üçün policy
CREATE POLICY "Demo files can be viewed by demo users" ON demo_files
  FOR SELECT USING (true);

CREATE POLICY "Demo files can be inserted by demo users" ON demo_files
  FOR INSERT WITH CHECK (true);
