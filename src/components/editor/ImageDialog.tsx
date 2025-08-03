import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Link2, X } from "lucide-react";

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
      
      setTimeout(() => {
        if (urlInputRef.current) {
          urlInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Set default alt text from filename
      setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
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
    const src = selectedFile ? previewUrl : imageUrl;
    if (!src || !imageAlt.trim()) return;
    
    onInsertImage({
      src,
      alt: imageAlt.trim(),
      width: imageWidth || undefined,
      height: imageHeight || undefined
    });
    
    handleClose();
  };

  const handleClose = () => {
    setImageUrl("");
    setImageAlt("");
    setImageWidth("");
    setImageHeight("");
    setSelectedFile(null);
    setPreviewUrl("");
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
    const hasSource = selectedFile || (imageUrl && isValidImageUrl(imageUrl));
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
        
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link2 size={16} />
              From URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} />
              Upload File
            </TabsTrigger>
          </TabsList>
          
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
                >
                  <Upload size={16} className="mr-2" />
                  {selectedFile ? selectedFile.name : "Choose File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
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
      </DialogContent>
    </Dialog>
  );
};