import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crop, Square, Monitor, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AspectRatio {
  label: string;
  value: number | null; // null for freeform
  icon?: React.ReactNode;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageElement: HTMLImageElement | null;
  onApplyChanges: (newImageSrc: string) => void;
}

const aspectRatios: AspectRatio[] = [
  { label: "Freeform", value: null, icon: <Crop className="w-4 h-4" /> },
  { label: "Original", value: 0, icon: <Monitor className="w-4 h-4" /> },
  { label: "1:1", value: 1, icon: <Square className="w-4 h-4" /> },
  { label: "4:3", value: 4/3 },
  { label: "16:9", value: 16/9 },
  { label: "3:4", value: 3/4, icon: <Smartphone className="w-4 h-4" /> },
  { label: "9:16", value: 9/16, icon: <Smartphone className="w-4 h-4" /> },
];

export const CropDialog = ({ 
  open, 
  onOpenChange, 
  imageElement, 
  onApplyChanges 
}: CropDialogProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    width: 200,
    height: 200
  });

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [loadedImageDimensions, setLoadedImageDimensions] = useState({ width: 0, height: 0 });

  const setupCropArea = useCallback(() => {
    if (!containerRef.current || !imageElement) return;
    
    // Use imageElement dimensions directly
    const naturalWidth = imageElement.naturalWidth || 0;
    const naturalHeight = imageElement.naturalHeight || 0;
    
    if (naturalWidth === 0 || naturalHeight === 0) {
      console.log('⚠️ No valid image dimensions available');
      return;
    }
    
    console.log('Setting up crop area with dimensions:', naturalWidth, 'x', naturalHeight);
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxWidth = Math.min(500, containerRect.width - 40);
    const maxHeight = 400;
    
    const aspectRatio = naturalWidth / naturalHeight;
    let displayWidth = maxWidth;
    let displayHeight = displayWidth / aspectRatio;
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * aspectRatio;
    }
    
    console.log('Display size calculated:', displayWidth, 'x', displayHeight);
    setImageSize({ width: displayWidth, height: displayHeight });
    
    // Initialize crop to center
    const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
    setCropData({
      x: (displayWidth - initialSize) / 2,
      y: (displayHeight - initialSize) / 2,
      width: initialSize,
      height: initialSize
    });
  }, [imageElement]);

  useEffect(() => {
    if (imageElement && containerRef.current && open) {
      console.log('=== CROP DIALOG DEBUG ===');
      console.log('Image element:', imageElement);
      console.log('Image src:', imageElement.src);
      console.log('Image naturalWidth:', imageElement.naturalWidth);
      console.log('Image naturalHeight:', imageElement.naturalHeight);
      console.log('Image complete:', imageElement.complete);
      
      // Wait a bit for image to be fully loaded, then setup crop area
      const timer = setTimeout(() => {
        setupCropArea();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [imageElement, open, setupCropArea]);

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    if (action === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
      setResizeHandle(handle || '');
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || (!isDragging && !isResizing)) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      const newX = Math.max(0, Math.min(x - cropData.width / 2, imageSize.width - cropData.width));
      const newY = Math.max(0, Math.min(y - cropData.height / 2, imageSize.height - cropData.height));
      setCropData(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      let newCrop = { ...cropData };
      
      if (resizeHandle.includes('right')) {
        newCrop.width = Math.max(50, Math.min(x - cropData.x, imageSize.width - cropData.x));
      }
      if (resizeHandle.includes('bottom')) {
        newCrop.height = Math.max(50, Math.min(y - cropData.y, imageSize.height - cropData.y));
      }
      if (resizeHandle.includes('left')) {
        const newWidth = Math.max(50, cropData.x + cropData.width - x);
        const newX = Math.max(0, x);
        newCrop.x = newX;
        newCrop.width = newWidth;
      }
      if (resizeHandle.includes('top')) {
        const newHeight = Math.max(50, cropData.y + cropData.height - y);
        const newY = Math.max(0, y);
        newCrop.y = newY;
        newCrop.height = newHeight;
      }

      // Apply aspect ratio constraint if selected
      if (selectedRatio && selectedRatio > 0) {
        if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
          newCrop.height = newCrop.width / selectedRatio;
        } else {
          newCrop.width = newCrop.height * selectedRatio;
        }
      }

      setCropData(newCrop);
    }
  }, [isDragging, isResizing, cropData, imageSize, selectedRatio, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleAspectRatioChange = (ratio: number | null) => {
    setSelectedRatio(ratio);
    
    if (ratio === 0 && imageElement) {
      // Original ratio
      const originalRatio = imageElement.naturalWidth / imageElement.naturalHeight;
      setSelectedRatio(originalRatio);
    }
    
    if (ratio && ratio > 0) {
      const newHeight = cropData.width / ratio;
      const maxHeight = imageSize.height - cropData.y;
      
      if (newHeight <= maxHeight) {
        setCropData(prev => ({ ...prev, height: newHeight }));
      } else {
        const newWidth = maxHeight * ratio;
        setCropData(prev => ({ ...prev, width: newWidth, height: maxHeight }));
      }
    }
  };

  const cropAndUploadImage = async () => {
    if (!imageElement || !canvasRef.current) return;

    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Calculate scale factor between display size and natural size
      const naturalWidth = imageElement.naturalWidth;
      const naturalHeight = imageElement.naturalHeight;
        
      const scaleX = naturalWidth / imageSize.width;
      const scaleY = naturalHeight / imageSize.height;

      // Set canvas size to crop dimensions in natural image coordinates
      const cropWidth = cropData.width * scaleX;
      const cropHeight = cropData.height * scaleY;
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped portion
      ctx.drawImage(
        imageElement,
        cropData.x * scaleX, // source x
        cropData.y * scaleY, // source y
        cropWidth, // source width
        cropHeight, // source height
        0, // destination x
        0, // destination y
        cropWidth, // destination width
        cropHeight // destination height
      );

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      // Create file from blob for upload
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      // Use file-upload function (same as ImageDialog and FileManager)
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
      console.log('Crop upload result:', result);
      
      // Get signed URL for the uploaded cropped file
      const { data, error } = await supabase.storage
        .from('user-files')
        .createSignedUrl(result.file.storage_path, 3600);

      if (error) throw error;

      const signedUrl = data.signedUrl;
      toast.success('Image cropped and uploaded successfully!');
      onApplyChanges(signedUrl);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error cropping and uploading image:', error);
      toast.error('Failed to crop and upload image');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imageElement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">

          <div>
            <Label className="text-sm font-medium mb-2 block">Aspect Ratio</Label>
            <div className="grid grid-cols-4 gap-2">
              {aspectRatios.map((ratio) => (
                <Button
                  key={ratio.label}
                  variant={selectedRatio === ratio.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAspectRatioChange(ratio.value)}
                  className="flex flex-col items-center gap-1 h-auto p-2"
                >
                  {ratio.icon || <div className="w-4 h-4" />}
                  <span className="text-xs">{ratio.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {imageElement && imageSize.width > 0 && imageSize.height > 0 ? (
            <div
              ref={containerRef}
              className="relative border border-border rounded-lg overflow-hidden bg-muted"
              style={{ height: imageSize.height + 40 }}
            >
              <img
                src={imageElement.src}
                alt="Crop preview"
                className="absolute top-5 left-5"
                style={{
                  width: imageSize.width,
                  height: imageSize.height,
                  objectFit: 'contain'
                }}
                draggable={false}
              />
              
              {/* Crop overlay */}
              <div
                className="absolute border-2 border-primary bg-primary/20 cursor-move"
                style={{
                  left: cropData.x + 20,
                  top: cropData.y + 20,
                  width: cropData.width,
                  height: cropData.height,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'drag')}
              >
                {/* Resize handles */}
                <div
                  className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-background cursor-nw-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'top-left')}
                />
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-background cursor-ne-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'top-right')}
                />
                <div
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-background cursor-sw-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom-left')}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-background cursor-se-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom-right')}
                />
              </div>
            </div>
          ) : imageElement ? (
            <div className="border border-border rounded-lg p-8 text-center bg-muted">
              <p className="text-muted-foreground">Loading image for cropping...</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg p-8 text-center bg-muted">
              <p className="text-muted-foreground">No image selected for cropping</p>
            </div>
          )}

          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={cropAndUploadImage} disabled={isProcessing || !imageElement}>
              {isProcessing ? 'Processing...' : 'Crop & Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};