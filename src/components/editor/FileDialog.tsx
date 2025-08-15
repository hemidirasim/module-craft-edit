import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileManagerDialog } from './FileManagerDialog';
import { FileText, X, Download } from 'lucide-react';

interface FileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (fileUrl: string, fileName: string, fileType: string) => void;
}

export const FileDialog = ({ open, onOpenChange, onInsert }: FileDialogProps) => {
  const [showFileManager, setShowFileManager] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [linkText, setLinkText] = useState('');

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setLinkText(file.original_name);
    setShowFileManager(false);
  };

  const handleInsert = () => {
    if (selectedFile) {
      onInsert(selectedFile.public_url, linkText || selectedFile.original_name, selectedFile.file_type);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setLinkText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Insert File
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div className="space-y-2">
            <Label>Select File</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFileManager(true)}
                className="flex-1"
              >
                <FileText size={16} className="mr-2" />
                Choose File
              </Button>
            </div>
            
            {selectedFile && (
              <div className="border rounded p-3 bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.original_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile.file_type} • {(selectedFile.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Link Text */}
          <div className="space-y-2">
            <Label htmlFor="link-text">Link Text (optional)</Label>
            <Input
              id="link-text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Text to display for the link"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the file name
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={handleClose} variant="outline">
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleInsert} 
            disabled={!selectedFile}
          >
            <Download size={16} className="mr-2" />
            Insert File
          </Button>
        </div>
        
        <FileManagerDialog
          open={showFileManager}
          onOpenChange={setShowFileManager}
          onSelectFile={handleFileSelect}
          fileTypeFilter="all"
        />
      </DialogContent>
    </Dialog>
  );
};
