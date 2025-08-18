import { useState, useRef } from 'react';
import { 
  File, 
  Image, 
  Video, 
  FileText, 
  Download,
  Clock,
  AlertCircle,
  Eye,
  Play,
  Users
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
    downloadFile,
    getFileUrl,
    isSessionValid
  } = useDemoFileManager();

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
      toast.success(`Selected: ${file.file_name}`);
    }
  };

  const handlePreview = (file: any) => {
    const url = getFileUrl(file);
    window.open(url, '_blank');
  };

  const handleDownload = (file: any) => {
    try {
      downloadFile(file);
      toast.success(`Downloaded: ${file.file_name}`);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (!isSessionValid()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Demo session invalid</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Demo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Info Alert */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              <strong>Demo Mode:</strong> These are sample files to showcase our file manager features.
            </span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              Demo
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading demo files...</div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No demo files available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card 
              key={file.id} 
              className={`p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-0 bg-gradient-to-br from-card to-card/50 ${
                selectMode ? 'hover:bg-muted/50 hover:border-primary/50' : ''
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="space-y-3">
                {/* File Icon/Thumbnail */}
                <div className="flex items-center justify-center h-20">
                  {file.file_type === 'image' ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={getFileUrl(file)}
                        alt={file.file_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full bg-muted rounded flex items-center justify-center">' +
                              getFileIcon(file.file_type).props.children +
                              '</div>';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-muted to-muted/50">
                      {getFileIcon(file.file_type)}
                    </div>
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
                  <div className="text-xs text-muted-foreground">
                    {formatDate(file.created_at)}
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
                      className="flex-1 h-8"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="flex-1 h-8"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}

                {selectMode && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      Click to select this file
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Features Showcase */}
      <div className="mt-8 p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border">
        <h3 className="font-semibold mb-2 text-center">🚀 What you can do with our File Manager:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-blue-500">📁</div>
            <div>Organize files in folders</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-green-500">⬆️</div>
            <div>Drag & drop file uploads</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-purple-500">🔍</div>
            <div>Advanced search & filtering</div>
          </div>
        </div>
      </div>
    </div>
  );
};