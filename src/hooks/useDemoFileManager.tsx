import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DemoFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
}

export const useDemoFileManager = () => {
  const [files, setFiles] = useState<DemoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get or create demo session
  const getOrCreateSession = async () => {
    try {
      // Check if we already have a session in localStorage
      const existingSessionId = localStorage.getItem('demo_session_id');
      const sessionExpiry = localStorage.getItem('demo_session_expiry');
      
      if (existingSessionId && sessionExpiry && new Date() < new Date(sessionExpiry)) {
        setSessionId(existingSessionId);
        return existingSessionId;
      }

      // Create new demo session
      const { data, error } = await supabase.rpc('create_demo_user');
      if (error) throw error;
      
      const newSessionId = data;
      const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      localStorage.setItem('demo_session_id', newSessionId);
      localStorage.setItem('demo_session_expiry', expiryTime.toISOString());
      
      setSessionId(newSessionId);
      return newSessionId;
    } catch (error) {
      console.error('Error creating demo session:', error);
      throw error;
    }
  };

  const fetchDemoFiles = async () => {
    try {
      if (!sessionId) return;
      
      const { data, error } = await supabase.rpc('get_demo_files', {
        p_session_id: sessionId
      });
      
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching demo files:', error);
      setFiles([]);
    }
  };

  const uploadDemoFile = async (file: File) => {
    try {
      if (!sessionId) {
        throw new Error('No demo session available');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);

      const response = await fetch(`https://qgmluixnzhpthywyrytn.supabase.co/functions/v1/demo-file-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Upload failed');
      }

      const result = await response.json();
      await fetchDemoFiles(); // Refresh files list
      return result;
    } catch (error) {
      console.error('Error uploading demo file:', error);
      throw error;
    }
  };

  const deleteDemoFile = async (fileId: string) => {
    try {
      // Demo files auto-expire, no need for manual deletion
      // Just remove from UI for now
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting demo file:', error);
      throw error;
    }
  };

  const getFileUrl = (file: DemoFile) => {
    return file.public_url;
  };

  const downloadFile = (file: DemoFile) => {
    const link = document.createElement('a');
    link.href = file.public_url;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSessionTimeRemaining = () => {
    const sessionExpiry = localStorage.getItem('demo_session_expiry');
    if (!sessionExpiry) return 0;
    
    const expiryTime = new Date(sessionExpiry).getTime();
    const currentTime = Date.now();
    return Math.max(0, expiryTime - currentTime);
  };

  // Initialize session and load files
  useEffect(() => {
    const initializeDemo = async () => {
      setLoading(true);
      try {
        const session = await getOrCreateSession();
        if (session) {
          await fetchDemoFiles();
        }
      } catch (error) {
        console.error('Error initializing demo:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDemo();
  }, []);

  // Refresh files when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchDemoFiles();
    }
  }, [sessionId]);

  return {
    files,
    loading,
    sessionId,
    uploadFile: uploadDemoFile,
    deleteFile: deleteDemoFile,
    getFileUrl,
    downloadFile,
    refresh: fetchDemoFiles,
    getSessionTimeRemaining,
    isSessionValid: () => sessionId !== null
  };
};