import { useState } from 'react';
import { 
  Folder as FolderIcon, 
  File, 
  Image, 
  Video, 
  FileText, 
  Download,
  Trash2,
  Upload,
  Plus,
  ArrowLeft,
  Grid3X3,
  List,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useFileManager } from '@/hooks/useFileManager';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FileManagerProps {
  onSelectFile?: (file: any) => void;
  selectMode?: boolean;
}

export const FileManager = ({ onSelectFile, selectMode = false }: FileManagerProps) => {
  const { user } = useAuth();
  const {
    folders,
    files,
    currentFolderId,
    loading,
    setCurrentFolderId,
    createFolder,
    deleteFolder,
    deleteFile,
    uploadFile,
    getSignedUrl,
    refresh
  } = useFileManager();

  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  const fileTypes = [
    { value: 'all', label: 'All Files' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'document', label: 'Documents' },
    { value: 'other', label: 'Other' }
  ];

  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'excel':
        return <File className="w-8 h-8 text-green-500" />;
      case 'document':
        return <FileText className="w-8 h-8 text-blue-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName, currentFolderId);
      setNewFolderName('');
      setShowNewFolderDialog(false);
      toast.success('Folder created successfully');
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadFile(file, currentFolderId);
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleFileDownload = async (file: any) => {
    try {
      const signedUrl = await getSignedUrl(file.storage_path);
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = file.original_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleDeleteFile = async (file: any) => {
    try {
      await deleteFile(file.id, file.storage_path);
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      toast.success('Folder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  const getCurrentFolder = () => {
    return folders.find(f => f.id === currentFolderId);
  };

  const getSubfolders = () => {
    return folders.filter(f => f.parent_folder_id === currentFolderId);
  };

  const getFilteredFiles = () => {
    let filtered = files;

    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.file_type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access file manager</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentFolderId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentFolder = getCurrentFolder();
                setCurrentFolderId(currentFolder?.parent_folder_id || null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h2 className="text-xl font-semibold">
            {getCurrentFolder()?.name || 'My Files'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder();
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <label className="cursor-pointer">
            <Button size="sm" disabled={isUploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </span>
            </Button>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {fileTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Folders */}
        {getSubfolders().length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Folders</h3>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
              {getSubfolders().map((folder) => (
                <Card
                  key={folder.id}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                    viewMode === 'list' ? 'flex items-center justify-between' : 'text-center'
                  }`}
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <div className={`flex ${viewMode === 'list' ? 'items-center gap-3' : 'flex-col items-center gap-2'}`}>
                    <FolderIcon className="w-8 h-8 text-blue-500" />
                    <span className="text-sm font-medium truncate">{folder.name}</span>
                  </div>
                  
                  {viewMode === 'list' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{folder.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteFolder(folder.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Files</h3>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : getFilteredFiles().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No files found</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
              {getFilteredFiles().map((file) => (
                <Card
                  key={file.id}
                  className={`p-4 hover:bg-accent transition-colors ${
                    selectMode ? 'cursor-pointer' : ''
                  } ${viewMode === 'list' ? 'flex items-center justify-between' : 'text-center'}`}
                  onClick={selectMode ? () => onSelectFile?.(file) : undefined}
                >
                  <div className={`flex ${viewMode === 'list' ? 'items-center gap-3 flex-1' : 'flex-col items-center gap-2'}`}>
                    {getFileIcon(file.file_type, file.mime_type)}
                    <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                      <p className="text-sm font-medium truncate">{file.original_name}</p>
                      {viewMode === 'list' && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {viewMode === 'grid' && (
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {file.file_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {!selectMode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDownload(file);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete File</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{file.original_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteFile(file)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};