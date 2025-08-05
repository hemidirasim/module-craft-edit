import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Link2, X, Files, Crop } from "lucide-react";
import { CropDialog } from "./CropDialog";
import { FileManagerDialog } from "./FileManagerDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (imageData: { src: string; alt: string; width?: string; height?: string }) => void;
}

export const ImageDialog = ({ open, onOpenChange, onInsertImage }: ImageDialogProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [currentImageElement, setCurrentImageElement] = useState<HTMLImageElement | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setImageUrl("");
      setImageAlt("");
      setImageWidth("");
      setImageHeight("");
      setSelectedFile(null);
      setPreviewUrl("");
      setUploadedImageUrl("");
      setCurrentImageElement(null);
      
      setTimeout(() => {
        if (urlInputRef.current) {
          urlInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setIsUploading(true);
      
      try {
        // Get session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        const formData = new FormData();
        formData.append('file', file);
        // Don't set folder_id so it goes to root folder in file manager

        // Use file-upload function (same as FileManager) instead of upload-image
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
        setUploadedImageUrl(signedUrl);
        setPreviewUrl(signedUrl);
        toast.success('Image uploaded successfully and added to File Manager!');
        
        // Set default alt text from filename
        setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url && isValidImageUrl(url)) {
      setPreviewUrl(url);
      // Try to extract filename for alt text
      const filename = url.split('/').pop()?.split('?')[0] || '';
      if (filename && !imageAlt) {
        setImageAlt(filename.replace(/\.[^/.]+$/, ""));
      }
    } else {
      setPreviewUrl("");
    }
  };

  const handleInsert = () => {
    const src = uploadedImageUrl || imageUrl;
    console.log('🚀 ImageDialog handleInsert called with:', {
      src,
      alt: imageAlt.trim(),
      width: imageWidth,
      height: imageHeight,
      hasSource: !!src,
      hasAlt: !!imageAlt.trim(),
      canInsert: canInsert()
    });
    
    if (!src || !imageAlt.trim()) {
      console.log('❌ Insert failed - missing src or alt:', { src: !!src, alt: !!imageAlt.trim() });
      return;
    }
    
    const imageData = {
      src,
      alt: imageAlt.trim(),
      width: imageWidth || undefined,
      height: imageHeight || undefined
    };
    
    console.log('✅ Calling onInsertImage with:', imageData);
    onInsertImage(imageData);
    
    handleClose();
  };

  const handleCrop = () => {
    const currentImageUrl = uploadedImageUrl || imageUrl;
    console.log('=== STARTING CROP ===');
    console.log('Current image URL:', currentImageUrl);
    console.log('Is valid URL:', isValidImageUrl(currentImageUrl));
    
    if (currentImageUrl && isValidImageUrl(currentImageUrl)) {
      console.log('Creating new image element...');
      const img = document.createElement('img');
      
      // Remove crossOrigin to avoid CORS issues with same-origin images
      // img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Image loaded successfully!');
        console.log('Natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
        console.log('Current src:', img.src);
        console.log('Complete:', img.complete);
        setCurrentImageElement(img);
        setShowCropDialog(true);
      };
      
      img.onerror = (error) => {
        console.error('❌ Failed to load image for crop:', error);
        console.log('Failed URL:', currentImageUrl);
        toast.error('Failed to load image for cropping');
      };
      
      console.log('Setting image src to:', currentImageUrl);
      img.src = currentImageUrl;
    } else {
      console.log('❌ No valid image to crop');
      toast.error('No valid image to crop');
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setUploadedImageUrl(croppedImageUrl);
    setPreviewUrl(croppedImageUrl);
    setShowCropDialog(false);
  };

  const handleFileSelect = async (file: any) => {
    if (file.file_type === 'image') {
      try {
        console.log('Selected file:', file);
        console.log('Storage path:', file.storage_path);
        
        // Use Supabase client to get signed URL (same as FileManager)
        const { data, error } = await supabase.storage
          .from('user-files')
          .createSignedUrl(file.storage_path, 3600);

        if (error) {
          console.error('Supabase storage error:', error);
          throw error;
        }

        console.log('Signed URL data:', data);
        
        const fullUrl = data.signedUrl;
        console.log('Final image URL:', fullUrl);
        
        setUploadedImageUrl(fullUrl);
        setPreviewUrl(fullUrl);
        setImageAlt(file.original_name.replace(/\.[^/.]+$/, ""));
      } catch (error) {
        console.error('Error getting signed URL:', error);
        toast.error('Failed to load image');
      }
    } else {
      toast.error('Please select an image file');
    }
  };

  const handleClose = () => {
    setImageUrl("");
    setImageAlt("");
    setImageWidth("");
    setImageHeight("");
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadedImageUrl("");
    setCurrentImageElement(null);
    onOpenChange(false);
  };

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  };

  const canInsert = () => {
    const hasSource = uploadedImageUrl || (imageUrl && isValidImageUrl(imageUrl));
    return hasSource && imageAlt.trim();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image size={20} />
            Insert Image
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
                Select an image from your uploaded files
              </p>
              <Button onClick={() => setShowFileManager(true)}>
                Open File Manager
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                ref={urlInputRef}
                id="image-url"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleInsert();
                  }
                }}
              />
              {imageUrl && !isValidImageUrl(imageUrl) && (
                <p className="text-sm text-destructive">Please enter a valid image URL</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label>Select Image File</Label>
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
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview and Crop */}
        {previewUrl && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Preview</Label>
              {(uploadedImageUrl || (imageUrl && isValidImageUrl(imageUrl))) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCrop}
                >
                  <Crop size={16} className="mr-2" />
                  Crop Image
                </Button>
              )}
            </div>
            <div className="border rounded p-2 flex justify-center bg-muted/50">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-48 object-contain"
              />
            </div>
          </div>
        )}

        {/* Image Properties */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-alt">Alt Text (required)</Label>
            <Input
              id="image-alt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image-width">Width (optional)</Label>
              <Input
                id="image-width"
                value={imageWidth}
                onChange={(e) => setImageWidth(e.target.value)}
                placeholder="e.g., 300px or 50%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-height">Height (optional)</Label>
              <Input
                id="image-height"
                value={imageHeight}
                onChange={(e) => setImageHeight(e.target.value)}
                placeholder="e.g., 200px or auto"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={handleClose} variant="outline">
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleInsert} 
            disabled={!canInsert()}
          >
            <Image size={16} className="mr-2" />
            Insert Image
          </Button>
        </div>
        
        <CropDialog
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageUrl={uploadedImageUrl || imageUrl}
          onApplyChanges={handleCropComplete}
        />
        
        <FileManagerDialog
          open={showFileManager}
          onOpenChange={setShowFileManager}
          onSelectFile={handleFileSelect}
          fileTypeFilter="image"
        />
      </DialogContent>
    </Dialog>
  );
};