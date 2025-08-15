import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface File {
  id: string;
  user_id: string;
  original_name: string;
  name: string;
  storage_path: string;
  file_size: bigint;
  file_type: string;
  mime_type: string;
  folder_id: string | null;
  public_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useFileManager = () => {
  const { user, session } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const fetchFiles = useCallback(async (folderId: string | null = null) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (folderId) {
        params.append('folder_id', folderId);
      }

      const response = await fetch(`/api/files?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files);
      setFolders(data.folders);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const uploadFile = useCallback(async (file: File, folderId: string | null = null) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folder_id', folderId);
    }

    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/upload-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    await fetchFiles(currentFolderId);
    return result.file;
  }, [user, currentFolderId, fetchFiles]);

  const deleteFile = useCallback(async (fileId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    await fetchFiles(currentFolderId);
  }, [user, currentFolderId, fetchFiles, getAuthHeaders]);

  const createFolder = useCallback(async (name: string, parentId: string | null = null) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, parent_id: parentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create folder');
    }

    await fetchFiles(currentFolderId);
  }, [user, currentFolderId, fetchFiles, getAuthHeaders]);

  const deleteFolder = useCallback(async (folderId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`/api/folders/${folderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete folder');
    }

    await fetchFiles(currentFolderId);
  }, [user, currentFolderId, fetchFiles, getAuthHeaders]);

  const navigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    fetchFiles(folderId);
  }, [fetchFiles]);

  // Fetch files when user changes or current folder changes
  useEffect(() => {
    if (user) {
      fetchFiles(currentFolderId);
    }
  }, [user, currentFolderId, fetchFiles]);

  return {
    files,
    folders,
    currentFolderId,
    loading,
    error,
    uploadFile,
    deleteFile,
    createFolder,
    deleteFolder,
    navigateToFolder,
    fetchFiles,
  };
};