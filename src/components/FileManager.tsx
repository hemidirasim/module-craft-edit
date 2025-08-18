import { useState, useRef, useEffect } from 'react';
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
  Search,
  Copy,
  Edit,
  Eye,
  Move,
  Play,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useFileManager } from '@/hooks/useFileManager';
import { useAuth } from '@/hooks/useAuth';
import { DemoFileManager } from './DemoFileManager';
import { toast } from 'sonner';

interface FileManagerProps {
  onSelectFile?: (file: any) => void;
  selectMode?: boolean;
  fileTypeFilter?: 'image' | 'document' | 'all';
  demoMode?: boolean;
}

export const FileManager = ({ 
  onSelectFile, 
  selectMode = false, 
  fileTypeFilter = 'all',
  demoMode = false 
}: FileManagerProps) => {
  const { user } = useAuth();

  // If demo mode is explicitly requested or user is not logged in, use demo mode
  const shouldUseDemoMode = demoMode || !user;

  if (shouldUseDemoMode) {
    return (
      <div className="space-y-4">
        {/* Demo Mode Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Demo File Manager</h2>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              Demo Mode
            </Badge>
          </div>
          
          {!user && (
            <Alert className="max-w-md">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign up for free
                </Button>
                {' '}to save your files permanently and access advanced features.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DemoFileManager onSelectFile={onSelectFile} selectMode={selectMode} />
      </div>
    );
  }
  const {
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
    refresh
  } = useFileManager();

  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detailed'>('grid');
  const [thumbnailMode, setThumbnailMode] = useState<'small' | 'medium' | 'large'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [newFolderRenameValue, setNewFolderRenameValue] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showFolderRenameDialog, setShowFolderRenameDialog] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getFilteredAndSortedFiles = () => {
    let filtered = files;

    // Apply fileTypeFilter prop
    if (fileTypeFilter === 'image') {
      filtered = filtered.filter(f => f.file_type === 'image');
    } else if (fileTypeFilter === 'document') {
      filtered = filtered.filter(f => ['document', 'pdf', 'excel'].includes(f.file_type));
    }

    // Filter by type (from dropdown)
    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.file_type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort files
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.original_name.toLowerCase();
          bValue = b.original_name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'size':
          aValue = a.file_size;
          bValue = b.file_size;
          break;
        case 'type':
          aValue = a.file_type;
          bValue = b.file_type;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // File Thumbnail Component
  const FileThumbnail = ({ file }: { file: any }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (file.file_type === 'image') {
        const loadSignedUrl = async () => {
          try {
            const signedUrl = await getSignedUrl(file.storage_path);
            setImageUrl(signedUrl);
          } catch (error) {
            console.error('Error loading signed URL:', error);
            setImageError(true);
          }
        };
        loadSignedUrl();
      }
    }, [file.storage_path, file.file_type]);

    if (file.file_type === 'image' && !imageError && imageUrl) {
      return (
        <div className={`relative overflow-hidden rounded ${
          thumbnailMode === 'small' ? 'w-12 h-12' : 
          thumbnailMode === 'medium' ? 'w-16 h-16' : 'w-20 h-20'
        }`}>
          <img 
            src={imageUrl}
            alt={file.original_name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => handlePreviewFile(file)}
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return getFileIcon(file.file_type, file.mime_type);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of droppedFiles) {
        await uploadFile(file, currentFolderId);
      }
      toast.success(`${droppedFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  // Context menu handlers
  const handleCopyUrl = async (file: any) => {
    try {
      const signedUrl = await getSignedUrl(file.storage_path);
      await navigator.clipboard.writeText(signedUrl);
      toast.success('File URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      await renameFile(fileId, newName);
      toast.success('File renamed successfully');
      setRenameFileId(null);
      setNewFileName('');
    } catch (error) {
      toast.error('Failed to rename file');
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await renameFolder(folderId, newName);
      toast.success('Folder renamed successfully');
      setRenameFolderId(null);
      setNewFolderRenameValue('');
    } catch (error) {
      toast.error('Failed to rename folder');
    }
  };

  const handlePreviewFile = async (file: any) => {
    try {
      const signedUrl = await getSignedUrl(file.storage_path);
      window.open(signedUrl, '_blank');
    } catch (error) {
      toast.error('Failed to preview file');
    }
  };

  // Drag & Drop for moving files/folders
  const handleFileDragStart = (e: React.DragEvent, file: any) => {
    console.log('File drag start:', file.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'file', data: file }));
  };

  const handleFolderDragStart = (e: React.DragEvent, folder: any) => {
    console.log('Folder drag start:', folder.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'folder', data: folder }));
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFolderDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const dragDataString = e.dataTransfer.getData('application/json');
      console.log('Drop data:', dragDataString);
      
      if (!dragDataString) return;
      
      const dragData = JSON.parse(dragDataString);
      console.log('Parsed drag data:', dragData);
      
      if (dragData.type === 'file') {
        console.log('Moving file:', dragData.data.id, 'to folder:', targetFolderId);
        const result = await moveFile(dragData.data.id, targetFolderId);
        if (result.success) {
          toast.success('File moved successfully');
        }
      } else if (dragData.type === 'folder') {
        if (dragData.data.id !== targetFolderId) {
          console.log('Moving folder:', dragData.data.id, 'to folder:', targetFolderId);
          const result = await moveFolder(dragData.data.id, targetFolderId);
          if (result.success) {
            toast.success('Folder moved successfully');
          }
        }
      }
    } catch (error) {
      console.error('Drop error:', error);
      toast.error('Failed to move item');
    }
  };

  // At this point we know user is logged in and not in demo mode

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
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'grid' | 'list' | 'detailed')}
            className="px-3 py-1 border rounded-md bg-background text-sm"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
            <option value="detailed">Detailed View</option>
          </select>
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
              ref={fileInputRef}
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

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy as 'name' | 'date' | 'size' | 'type');
              setSortOrder(newSortOrder as 'asc' | 'desc');
            }}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="date-desc">Date (Newest)</option>
            <option value="size-asc">Size (Smallest)</option>
            <option value="size-desc">Size (Largest)</option>
            <option value="type-asc">Type (A-Z)</option>
            <option value="type-desc">Type (Z-A)</option>
          </select>

          <select
            value={thumbnailMode}
            onChange={(e) => setThumbnailMode(e.target.value as 'small' | 'medium' | 'large')}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="small">Small Thumbnails</option>
            <option value="medium">Medium Thumbnails</option>
            <option value="large">Large Thumbnails</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-[400px] border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOverCapture={(e) => {
          // Allow dropping files/folders to root when not in a specific folder  
          const dragData = e.dataTransfer?.types.includes('application/json');
          if (dragData && !currentFolderId) {
            e.preventDefault();
          }
        }}
        onDropCapture={async (e) => {
          // Only handle drops to root folder when we're in root
          if (!currentFolderId) {
            e.preventDefault();
            e.stopPropagation();
            
            const dragDataString = e.dataTransfer?.getData('application/json');
            if (dragDataString) {
              try {
                const dragData = JSON.parse(dragDataString);
                if (dragData.type === 'file') {
                  const result = await moveFile(dragData.data.id, null);
                  if (result.success) {
                    toast.success('File moved to root folder');
                  }
                } else if (dragData.type === 'folder') {
                  const result = await moveFolder(dragData.data.id, null);
                  if (result.success) {
                    toast.success('Folder moved to root folder');
                  }
                }
              } catch (error) {
                console.error('Drop error:', error);
                toast.error('Failed to move item');
              }
            }
          }
        }}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-lg z-10">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Drop files here to upload</p>
            </div>
          </div>
        )}

        <div className="space-y-4 p-4">
          {/* Folders */}
          {getSubfolders().length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Folders</h3>
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
                  : viewMode === 'detailed'
                  ? 'grid grid-cols-1 gap-2'
                  : 'space-y-2'
              }>
                {getSubfolders().map((folder) => (
                  <ContextMenu key={folder.id}>
                     <ContextMenuTrigger>
                        <Card
                          className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                            viewMode === 'grid' ? 'text-center' : 'flex items-center justify-between'
                          }`}
                         onClick={() => setCurrentFolderId(folder.id)}
                         draggable
                          onDragStart={(e) => handleFolderDragStart(e, folder)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFolderDrop(e, folder.id);
                          }}
                        >
                          <div className={`flex ${
                            viewMode === 'grid' 
                              ? 'flex-col items-center gap-2' 
                              : 'items-center gap-3'
                          }`}>
                            <FolderIcon className="w-8 h-8 text-blue-500" />
                            <div className={viewMode === 'grid' ? 'text-center' : 'flex-1 min-w-0'}>
                              <span className="text-sm font-medium truncate max-w-full block" title={folder.name}>
                                {folder.name}
                              </span>
                              {viewMode === 'detailed' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Folder • Created: {new Date(folder.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                       </Card>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameFolderId(folder.id);
                          setNewFolderRenameValue(folder.name);
                          setShowFolderRenameDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Rename
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
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
            ) : getFilteredAndSortedFiles().length === 0 ? (
              <div className="text-center py-16">
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No files found</p>
                <p className="text-sm text-muted-foreground">Drag & drop files here or click Upload Files</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
                  : viewMode === 'detailed'
                  ? 'grid grid-cols-1 gap-2'
                  : 'space-y-2'
              }>
                {getFilteredAndSortedFiles().map((file) => (
                  <ContextMenu key={file.id}>
                    <ContextMenuTrigger>
                       <Card
                          className={`p-4 hover:bg-accent transition-colors ${
                            selectMode ? 'cursor-pointer' : ''
                          } ${viewMode === 'grid' ? 'text-center' : 'flex items-center justify-between'}`}
                         onClick={selectMode ? () => onSelectFile?.(file) : undefined}
                         draggable
                         onDragStart={(e) => handleFileDragStart(e, file)}
                       >
                           <div className={`flex ${
                             viewMode === 'grid' 
                               ? 'flex-col items-center gap-2' 
                               : 'items-center gap-3 flex-1'
                           }`}>
                             {viewMode === 'grid' || viewMode === 'detailed' ? <FileThumbnail file={file} /> : getFileIcon(file.file_type, file.mime_type)}
                            <div className={`${viewMode === 'grid' ? 'w-full' : 'flex-1 min-w-0'}`}>
                              <p className="text-sm font-medium truncate max-w-full" title={file.original_name}>
                                {file.original_name}
                              </p>
                              {(viewMode === 'list' || viewMode === 'detailed') && (
                                <div className="text-xs text-muted-foreground">
                                  <p>{formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                                  {viewMode === 'detailed' && (
                                    <p className="mt-1">
                                      Type: {file.file_type} • Modified: {new Date(file.updated_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            {viewMode === 'grid' && (
                              <div className="text-center w-full mt-2">
                                <Badge variant="secondary" className="text-xs mb-1">
                                  {file.file_type}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
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
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handlePreviewFile(file)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCopyUrl(file)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy URL
                      </ContextMenuItem>
                       <ContextMenuItem 
                         onClick={() => {
                           setRenameFileId(file.id);
                           setNewFileName(file.original_name);
                           setShowRenameDialog(true);
                         }}
                       >
                         <Edit className="w-4 h-4 mr-2" />
                         Rename
                       </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => handleFileDownload(file)}
                        className="text-blue-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </ContextMenuItem>
                      <ContextMenuItem 
                        onClick={() => handleDeleteFile(file)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New file name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (newFileName.trim() && renameFileId) {
                    handleRenameFile(renameFileId, newFileName);
                    setShowRenameDialog(false);
                  }
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (newFileName.trim() && renameFileId) {
                    handleRenameFile(renameFileId, newFileName);
                    setShowRenameDialog(false);
                  }
                }}
                disabled={!newFileName.trim()}
              >
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Rename Dialog */}
      <Dialog open={showFolderRenameDialog} onOpenChange={setShowFolderRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New folder name"
              value={newFolderRenameValue}
              onChange={(e) => setNewFolderRenameValue(e.target.value)}
              onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   if (newFolderRenameValue.trim() && renameFolderId) {
                     handleRenameFolder(renameFolderId, newFolderRenameValue);
                     setShowFolderRenameDialog(false);
                   }
                 }
               }}
             />
             <div className="flex gap-2 justify-end">
               <Button variant="outline" onClick={() => setShowFolderRenameDialog(false)}>
                 Cancel
               </Button>
               <Button 
                 onClick={() => {
                   if (newFolderRenameValue.trim() && renameFolderId) {
                     handleRenameFolder(renameFolderId, newFolderRenameValue);
                     setShowFolderRenameDialog(false);
                   }
                 }}
                disabled={!newFolderRenameValue.trim()}
              >
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};