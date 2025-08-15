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
  Eye
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { usePrismaFileManager } from '@/hooks/usePrismaFileManager';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FileManagerProps {
  onSelectFile?: (file: any) => void;
  selectMode?: boolean;
  fileTypeFilter?: 'image' | 'document' | 'all';
}

export const FileManager = ({ onSelectFile, selectMode = false, fileTypeFilter = 'all' }: FileManagerProps) => {
  console.log('🎯 FileManager props:', { onSelectFile, selectMode, fileTypeFilter });
  const { user } = useAuth();
  const {
    folders,
    files,
    loading,
    currentFolder,
    setCurrentFolder,
    createFolder,
    deleteFolder,
    deleteFile,
    uploadFile,
    refreshFiles
  } = usePrismaFileManager();

  // Debug logging
  useEffect(() => {
    if (files.length > 0) {
      console.log('📄 Files loaded:', files.length);
    }
  }, [files]);

  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort files
  const getFilteredAndSortedFiles = () => {
    let filteredFiles = files;

    // Apply file type filter
    if (fileTypeFilter === 'image') {
      filteredFiles = files.filter(file => file.fileType === 'image');
    } else if (fileTypeFilter === 'document') {
      filteredFiles = files.filter(file => 
        ['pdf', 'document', 'excel'].includes(file.fileType)
      );
    }

    // Apply search filter
    if (searchQuery) {
      filteredFiles = filteredFiles.filter(file =>
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.fileType === filterType);
    }

    // Sort files
    filteredFiles.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.originalName.toLowerCase();
          bValue = b.originalName.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'size':
          aValue = parseInt(a.fileSize);
          bValue = parseInt(b.fileSize);
          break;
        case 'type':
          aValue = a.fileType;
          bValue = b.fileType;
          break;
        default:
          aValue = a.originalName.toLowerCase();
          bValue = b.originalName.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredFiles;
  };

  const filteredFiles = getFilteredAndSortedFiles();

  // File upload handlers
  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(file, currentFolder || undefined);
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // File actions
  const handleFileClick = (file: any) => {
    if (selectMode && onSelectFile) {
      onSelectFile(file);
    } else {
      // Open file in new tab
      window.open(file.publicUrl, '_blank');
    }
  };

  const handleFileDownload = (file: any) => {
    const link = document.createElement('a');
    link.href = file.publicUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleFolderCreate = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder(newFolderName, currentFolder || undefined);
      setNewFolderName('');
      setShowNewFolderDialog(false);
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Delete folder error:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'document':
        return <FileText className="w-8 h-8 text-green-500" />;
      case 'excel':
        return <FileText className="w-8 h-8 text-green-600" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          {currentFolder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolder(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h2 className="text-lg font-semibold">
            {currentFolder ? 'Folder Contents' : 'File Manager'}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </Button>

          {!selectMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewFolderDialog(true)}
                disabled={!user}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Folder
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="document">Documents</option>
            <option value="excel">Spreadsheets</option>
            <option value="other">Others</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading files...</p>
            </div>
          </div>
        ) : (
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`p-4 min-h-full ${
              isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
            }`}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredFiles.map((file) => (
                  <ContextMenu key={file.id}>
                    <ContextMenuTrigger>
                      <Card
                        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          selectMode ? 'hover:ring-2 hover:ring-blue-500' : ''
                        }`}
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="text-center">
                          {getFileIcon(file.fileType)}
                          <p className="mt-2 text-sm font-medium truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(parseInt(file.fileSize))}
                          </p>
                        </div>
                      </Card>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleFileClick(file)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Open
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleFileDownload(file)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleFileDelete(file.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <ContextMenu key={file.id}>
                    <ContextMenuTrigger>
                      <Card
                        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          selectMode ? 'hover:ring-2 hover:ring-blue-500' : ''
                        }`}
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="flex items-center space-x-4">
                          {getFileIcon(file.fileType)}
                          <div className="flex-1">
                            <p className="font-medium">{file.originalName}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(parseInt(file.fileSize))} • {file.fileType}
                            </p>
                          </div>
                          <Badge variant="secondary">{file.fileType}</Badge>
                        </div>
                      </Card>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleFileClick(file)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Open
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleFileDownload(file)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleFileDelete(file.id)}
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

            {filteredFiles.length === 0 && !loading && (
              <div className="text-center py-12">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No files found</p>
                {!selectMode && (
                  <p className="text-sm text-gray-400 mt-2">
                    Upload files or create folders to get started
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFolderCreate()}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewFolderDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleFolderCreate}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};