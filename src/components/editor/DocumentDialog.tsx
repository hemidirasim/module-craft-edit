import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Link2, X, Files, Download } from "lucide-react";
import { FileManagerDialog } from "./FileManagerDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertDocument: (documentData: { 
    src: string; 
    name: string; 
    type: string; 
    size?: string;
    downloadText: string;
    documentText: string;
  }) => void;
}

export const DocumentDialog = ({ open, onOpenChange, onInsertDocument }: DocumentDialogProps) => {
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [downloadText, setDownloadText] = useState("Download");
  const [documentText, setDocumentText] = useState("Document");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDocumentUrl("");
      setDocumentName("");
      setDownloadText("Download");
      setDocumentText("Document");
      setSelectedFile(null);
      setUploadedDocumentUrl("");
      
      setTimeout(() => {
        if (urlInputRef.current) {
          urlInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isValidDocumentFile(file)) {
      setSelectedFile(file);
      setIsUploading(true);
      
      try {
        // Get session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        const formData = new FormData();
        formData.append('file', file);

        // Use file-upload function
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
        console.log('Upload result:', result);
        
        // Get signed URL for the uploaded file
        const { data, error } = await supabase.storage
          .from('user-files')
          .createSignedUrl(result.file.storage_path, 3600);

        if (error) throw error;

        const signedUrl = data.signedUrl;
        setUploadedDocumentUrl(signedUrl);
        toast.success('Document uploaded successfully and added to File Manager!');
        
        // Set default name from filename
        setDocumentName(file.name);
      } catch (error) {
        console.error('Error uploading document:', error);
        toast.error('Failed to upload document');
      } finally {
        setIsUploading(false);
      }
    } else {
      toast.error('Please select a valid document file (PDF, Word, or Excel)');
    }
  };

  const handleUrlChange = (url: string) => {
    setDocumentUrl(url);
    if (url && isValidDocumentUrl(url)) {
      // Try to extract filename for document name
      const filename = url.split('/').pop()?.split('?')[0] || '';
      if (filename && !documentName) {
        setDocumentName(filename);
      }
    }
  };

  const handleInsert = () => {
    const src = uploadedDocumentUrl || documentUrl;
    if (!src || !documentName.trim() || !downloadText.trim() || !documentText.trim()) return;
    
    const fileType = getFileType(src);
    
    onInsertDocument({
      src,
      name: documentName.trim(),
      type: fileType,
      size: selectedFile ? formatFileSize(selectedFile.size) : undefined,
      downloadText: downloadText.trim(),
      documentText: documentText.trim()
    });
    
    handleClose();
  };

  const handleFileSelect = async (file: any) => {
    if (isValidDocumentType(file.file_type)) {
      try {
        console.log('Selected file:', file);
        console.log('Storage path:', file.storage_path);
        
        // Use Supabase client to get signed URL
        const { data, error } = await supabase.storage
          .from('user-files')
          .createSignedUrl(file.storage_path, 3600);

        if (error) {
          console.error('Supabase storage error:', error);
          throw error;
        }

        console.log('Signed URL data:', data);
        
        const fullUrl = data.signedUrl;
        console.log('Final document URL:', fullUrl);
        
        setUploadedDocumentUrl(fullUrl);
        setDocumentName(file.original_name);
      } catch (error) {
        console.error('Error getting signed URL:', error);
        toast.error('Failed to load document');
      }
    } else {
      toast.error('Please select a document file (PDF, Word, or Excel)');
    }
  };

  const handleClose = () => {
    setDocumentUrl("");
    setDocumentName("");
    setDownloadText("Download");
    setDocumentText("Document");
    setSelectedFile(null);
    setUploadedDocumentUrl("");
    onOpenChange(false);
  };

  const isValidDocumentFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.includes(file.type);
  };

  const isValidDocumentUrl = (url: string) => {
    try {
      new URL(url);
      return /\.(pdf|doc|docx|xls|xlsx)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  };

  const isValidDocumentType = (fileType: string) => {
    return ['document', 'pdf', 'spreadsheet'].includes(fileType);
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      default:
        return 'Document';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canInsert = () => {
    const hasSource = uploadedDocumentUrl || (documentUrl && isValidDocumentUrl(documentUrl));
    return hasSource && documentName.trim() && downloadText.trim() && documentText.trim();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Insert Document
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="filemanager" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="filemanager" className="flex items-center gap-2">
              <Files size={16} />
              File Manager
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link2 size={16} />
              From URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} />
              Upload File
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="filemanager" className="space-y-4">
            <div className="text-center p-8 border border-dashed border-border rounded-lg">
              <Files className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Choose from File Manager</p>
              <p className="text-muted-foreground mb-4">
                Select a document from your uploaded files
              </p>
              <Button onClick={() => setShowFileManager(true)}>
                Open File Manager
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-url">Document URL</Label>
              <Input
                ref={urlInputRef}
                id="document-url"
                value={documentUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/document.pdf"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleInsert();
                  }
                }}
              />
              {documentUrl && !isValidDocumentUrl(documentUrl) && (
                <p className="text-sm text-destructive">Please enter a valid document URL (.pdf, .doc, .docx, .xls, .xlsx)</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label>Select Document File</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={isUploading}
                >
                  <Upload size={16} className="mr-2" />
                  {isUploading ? "Uploading..." : selectedFile ? selectedFile.name : "Choose File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Document Properties - Show only when file is selected */}
        {(uploadedDocumentUrl || (documentUrl && isValidDocumentUrl(documentUrl))) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-name">File Name (required)</Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter file name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="download-text">Download Button Text (required)</Label>
              <Input
                id="download-text"
                value={downloadText}
                onChange={(e) => setDownloadText(e.target.value)}
                placeholder="e.g. Download, Get File"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-text">Document Label Text (required)</Label>
              <Input
                id="document-text"
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="e.g. Document, File"
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                <p>File size: {formatFileSize(selectedFile.size)}</p>
                <p>File type: {getFileType(selectedFile.name)}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={handleClose} variant="outline">
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleInsert} 
            disabled={!canInsert()}
          >
            <Download size={16} className="mr-2" />
            Insert Document
          </Button>
        </div>
        
        <FileManagerDialog
          open={showFileManager}
          onOpenChange={setShowFileManager}
          onSelectFile={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  );
};