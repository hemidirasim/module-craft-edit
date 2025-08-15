import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Demo session ID-ni localStorage-də saxla
const DEMO_SESSION_KEY = 'demo_session_id';

// Demo istifadəçi yarat və ya mövcud olanı al
export const getOrCreateDemoSession = async (): Promise<string> => {
  try {
    // localStorage-dən mövcud session ID-ni al
    let sessionId = localStorage.getItem(DEMO_SESSION_KEY);
    
    if (!sessionId) {
      console.log('🆕 Creating new demo session...');
      
      // Yeni demo istifadəçi yarat
      const { data, error } = await supabase.rpc('create_demo_user');
      
      if (error) {
        console.error('❌ Error creating demo user:', error);
        throw error;
      }
      
      sessionId = data;
      localStorage.setItem(DEMO_SESSION_KEY, sessionId);
      
      console.log('✅ Demo session created:', sessionId);
    } else {
      console.log('📋 Using existing demo session:', sessionId);
    }
    
    return sessionId;
  } catch (error) {
    console.error('❌ Error in getOrCreateDemoSession:', error);
    throw error;
  }
};

// Demo fayl əlavə et
export const addDemoFile = async (
  fileName: string,
  fileType: string,
  fileSize: number,
  publicUrl: string,
  storagePath: string
): Promise<string> => {
  try {
    const sessionId = await getOrCreateDemoSession();
    
    console.log('📁 Adding demo file:', fileName);
    
    const { data, error } = await supabase.rpc('add_demo_file', {
      p_session_id: sessionId,
      p_file_name: fileName,
      p_file_type: fileType,
      p_file_size: fileSize,
      p_public_url: publicUrl,
      p_storage_path: storagePath
    });
    
    if (error) {
      console.error('❌ Error adding demo file:', error);
      throw error;
    }
    
    console.log('✅ Demo file added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in addDemoFile:', error);
    throw error;
  }
};

// Demo faylları al
export const getDemoFiles = async () => {
  try {
    const sessionId = await getOrCreateDemoSession();
    
    console.log('📂 Getting demo files for session:', sessionId);
    
    const { data, error } = await supabase.rpc('get_demo_files', {
      p_session_id: sessionId
    });
    
    if (error) {
      console.error('❌ Error getting demo files:', error);
      throw error;
    }
    
    console.log('✅ Demo files retrieved:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in getDemoFiles:', error);
    throw error;
  }
};

// Demo session-i təmizlə
export const clearDemoSession = () => {
  localStorage.removeItem(DEMO_SESSION_KEY);
  console.log('🗑️ Demo session cleared');
};

// Demo session-i məcburi yenilə
export const forceRefreshDemoSession = async (): Promise<string> => {
  console.log('🔄 Force refreshing demo session...');
  clearDemoSession();
  return await getOrCreateDemoSession();
};

// Demo session-in vaxtını yoxla
export const isDemoSessionValid = async (): Promise<boolean> => {
  try {
    const sessionId = localStorage.getItem(DEMO_SESSION_KEY);
    
    if (!sessionId) {
      return false;
    }
    
    // Session-in mövcudluğunu yoxla
    const { data, error } = await supabase
      .from('demo_users')
      .select('id')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      console.log('⚠️ Demo session expired or invalid');
      clearDemoSession();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking demo session:', error);
    return false;
  }
};

// Demo istifadəçi üçün fayl yüklə
export const uploadDemoFile = async (file: File): Promise<string> => {
  try {
    console.log('📤 Uploading demo file:', file.name);
    
    // Unikal fayl adı yarat
    const timestamp = Date.now();
    const uniqueFileName = `demo_${timestamp}_${file.name}`;
    
    // Supabase storage-ə yüklə
    const { data, error } = await supabase.storage
      .from('lovable-uploads')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
    
    // Public URL al
    const { data: urlData } = supabase.storage
      .from('lovable-uploads')
      .getPublicUrl(uniqueFileName);
    
    // Demo fayl olaraq qeydiyyatdan keçir
    await addDemoFile(
      file.name,
      file.type,
      file.size,
      urlData.publicUrl,
      uniqueFileName
    );
    
    console.log('✅ Demo file uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('❌ Error in uploadDemoFile:', error);
    throw error;
  }
};

// Demo istatistikaları al
export const getDemoStats = async () => {
  try {
    const sessionId = await getOrCreateDemoSession();
    
    const { data, error } = await supabase
      .from('demo_files')
      .select('*')
      .eq('demo_user_id', (
        await supabase
          .from('demo_users')
          .select('id')
          .eq('session_id', sessionId)
          .single()
      ).data?.id);
    
    if (error) {
      console.error('❌ Error getting demo stats:', error);
      throw error;
    }
    
    return {
      totalFiles: data?.length || 0,
      totalSize: data?.reduce((sum, file) => sum + file.file_size, 0) || 0,
      files: data || []
    };
  } catch (error) {
    console.error('❌ Error in getDemoStats:', error);
    throw error;
  }
};
