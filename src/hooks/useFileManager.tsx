import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Folder = Database['public']['Tables']['folders']['Row'];
type FileRecord = Database['public']['Tables']['files']['Row'];

export const useFileManager = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async (folderId: string | null = null) => {
    try {
      let query = supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (folderId) {
        query = query.eq('folder_id', folderId);
      } else {
        query = query.is('folder_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const createFolder = async (name: string, parentId: string | null = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const path = parentId ? `${parentId}/${name}` : name;

      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name,
          parent_folder_id: parentId,
          path
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchFolders();
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
      
      await fetchFolders();
      await fetchFiles(currentFolderId);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .update({ name: newName })
        .eq('id', folderId);

      if (error) throw error;
      
      await fetchFolders();
    } catch (error) {
      console.error('Error renaming folder:', error);
      throw error;
    }
  };

  const renameFile = async (fileId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ original_name: newName })
        .eq('id', fileId);

      if (error) throw error;
      
      await fetchFiles(currentFolderId);
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  };

  const moveFile = async (fileId: string, newFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ folder_id: newFolderId })
        .eq('id', fileId);

      if (error) throw error;
      
      await fetchFiles(currentFolderId);
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  };

  const moveFolder = async (folderId: string, newParentId: string | null) => {
    try {
      const { error } = await supabase
        .from('folders')
        .update({ parent_folder_id: newParentId })
        .eq('id', folderId);

      if (error) throw error;
      
      await fetchFolders();
    } catch (error) {
      console.error('Error moving folder:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
      
      await fetchFiles(currentFolderId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File, folderId: string | null = null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folder_id', folderId);

      const response = await fetch(`https://qgmluixnzhpthywyrytn.supabase.co/functions/v1/file-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      await fetchFiles(currentFolderId);
      return result.file;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      // Ensure we refresh the current folder after upload
      await fetchFiles(folderId);
    }
  };

  const getSignedUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFolders(),
        fetchFiles(currentFolderId)
      ]);
      setLoading(false);
    };

    loadData();
  }, [currentFolderId]);

  return {
    folders,
    files,
    currentFolderId,
    loading,
    setCurrentFolderId,
    createFolder,
    deleteFolder,
    deleteFile,
    renameFolder,
    renameFile,
    moveFile,
    moveFolder,
    uploadFile,
    getSignedUrl,
    refresh: () => {
      fetchFolders();
      fetchFiles(currentFolderId);
    }
  };
};