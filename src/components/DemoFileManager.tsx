import { useState, useRef } from 'react';
import { 
  File, 
  Image, 
  Video, 
  FileText, 
  Download,
  Upload,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDemoFileManager } from '@/hooks/useDemoFileManager';
import { toast } from 'sonner';

interface DemoFileManagerProps {
  onSelectFile?: (file: any) => void;
  selectMode?: boolean;
}

export const DemoFileManager = ({ onSelectFile, selectMode = false }: DemoFileManagerProps) => {
  const {
    files,
    loading,
    uploadFile,
    downloadFile,
    getFileUrl,
    getSessionTimeRemaining,
    isSessionValid
  } = useDemoFileManager();

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const getFileIcon = (fileType: string) => {
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

  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleFileUpload = async (uploadFiles: FileList) => {
    if (!uploadFiles || uploadFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(uploadFiles)) {
        await uploadFile(file);
      }
      toast.success(`${uploadFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = event.target.files;
    if (uploadFiles) {
      handleFileUpload(uploadFiles);
    }
    event.target.value = '';
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handleFileSelect = (file: any) => {
    if (selectMode && onSelectFile) {
      const fileData = {
        id: file.id,
        name: file.file_name,
        url: getFileUrl(file),
        type: file.file_type,
        size: file.file_size
      };
      onSelectFile(fileData);
    }
  };

  const handlePreview = (file: any) => {
    const url = getFileUrl(file);
    window.open(url, '_blank');
  };

  if (!isSessionValid()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Demo session expired or invalid</p>
          <Button onClick={() => window.location.reload()}>
            Start New Demo Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Demo Info Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Demo mode: Files will be automatically deleted after session expires
          </span>
          <Badge variant="secondary">
            Time remaining: {formatTimeRemaining(getSessionTimeRemaining())}
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Upload Section */}
      <div 
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-muted/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragging ? 'Drop files here' : 'Upload Demo Files'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop files here, or click to select files
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-4"
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
        />
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading demo files...</div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No demo files yet</p>
          <p className="text-sm">Upload some files to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card 
              key={file.id} 
              className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                selectMode ? 'hover:bg-muted/50' : ''
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="space-y-3">
                {/* File Icon/Thumbnail */}
                <div className="flex items-center justify-center h-16">
                  {file.file_type === 'image' ? (
                    <img
                      src={getFileUrl(file)}
                      alt={file.file_name}
                      className="max-h-16 max-w-full object-contain rounded"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        img.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    getFileIcon(file.file_type)
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm truncate" title={file.file_name}>
                    {file.file_name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(file.file_size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.file_type}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                {!selectMode && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(file);
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="flex-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};