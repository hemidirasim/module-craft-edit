import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const DEMO_USER_ID = 'demo-user';

export const usePrismaFileManager = () => {
  const { user, authLoading } = useAuth();
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const currentUserId = user?.id || DEMO_USER_ID;

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // For authenticated users, fetch from regular files
        const response = await fetch('/api/files', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setFiles(data.files || []);
          setFolders(data.folders || []);
        }
      } else {
        // For demo users, fetch from demo files
        const sessionId = localStorage.getItem('demoSessionId');
        if (sessionId) {
          const response = await fetch(`/api/demo/get-files?sessionId=${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            setFiles(data.files || []);
            setFolders([]); // Demo users don't have folders
          }
        }
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadFile = useCallback(async (file: File, folderId?: string) => {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const fileData = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileData)));

      const uploadData = {
        userId: currentUserId,
        fileName,
        fileData: base64Data,
        fileType: file.type,
        fileSize: file.size,
        folderId: folderId || null,
      };

      if (user) {
        // For authenticated users
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success('File uploaded successfully');
          fetchFiles();
          return result.file;
        } else {
          throw new Error('Upload failed');
        }
      } else {
        // For demo users
        const sessionId = localStorage.getItem('demoSessionId');
        if (!sessionId) {
          throw new Error('No demo session');
        }

        const publicUrl = `/api/files/${currentUserId}/${fileName}`;
        const demoFileData = {
          sessionId,
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size,
          publicUrl,
          storagePath: fileName,
        };

        const response = await fetch('/api/demo/add-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(demoFileData),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success('File uploaded successfully');
          fetchFiles();
          return result.file;
        } else {
          throw new Error('Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  }, [currentUserId, user, fetchFiles]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('File deleted successfully');
        fetchFiles();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  }, [fetchFiles]);

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!user) {
      toast.error('Folders are only available for authenticated users');
      return;
    }

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          parentId,
        }),
      });

      if (response.ok) {
        toast.success('Folder created successfully');
        fetchFiles();
      } else {
        throw new Error('Create folder failed');
      }
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error('Failed to create folder');
    }
  }, [user, fetchFiles]);

  const deleteFolder = useCallback(async (folderId: string) => {
    if (!user) {
      toast.error('Folders are only available for authenticated users');
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Folder deleted successfully');
        fetchFiles();
      } else {
        throw new Error('Delete folder failed');
      }
    } catch (error) {
      console.error('Delete folder error:', error);
      toast.error('Failed to delete folder');
    }
  }, [user, fetchFiles]);

  useEffect(() => {
    if (!authLoading) {
      fetchFiles();
    }
  }, [fetchFiles, authLoading]);

  return {
    folders,
    files,
    loading,
    currentFolder,
    setCurrentFolder,
    uploadFile,
    deleteFile,
    createFolder,
    deleteFolder,
    refreshFiles: fetchFiles,
  };
};
