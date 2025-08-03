import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  imageUrl: string;
  onApplyChanges: (newImageSrc: string) => void;
}

const aspectRatios: AspectRatio[] = [
  { label: "Freeform", value: null, icon: <Crop className="w-4 h-4" /> },
  { label: "1:1", value: 1, icon: <Square className="w-4 h-4" /> },
  { label: "4:3", value: 4/3 },
  { label: "16:9", value: 16/9 },
  { label: "3:4", value: 3/4, icon: <Smartphone className="w-4 h-4" /> },
  { label: "9:16", value: 9/16, icon: <Smartphone className="w-4 h-4" /> },
];

export const CropDialog = ({ 
  open, 
  onOpenChange, 
  imageUrl, 
  onApplyChanges 
}: CropDialogProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Crop data and display settings
  const [cropData, setCropData] = useState<CropData>({
    x: 50,
    y: 50,
    width: 200,
    height: 200
  });

  // Display dimensions
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Initialize when dialog opens
  useEffect(() => {
    if (open && imageUrl) {
      console.log('🎯 Loading image for crop:', imageUrl);
      setIsReady(false);
      
      const img = new Image();
      // Add crossOrigin to avoid tainted canvas
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Image loaded for crop');
        console.log('Dimensions:', img.naturalWidth, 'x', img.naturalHeight);
        
        // Calculate display size
        const containerWidth = 600;
        const containerHeight = 400;
        
        const imageAspect = img.naturalWidth / img.naturalHeight;
        
        let displayWidth = containerWidth;
        let displayHeight = displayWidth / imageAspect;
        
        if (displayHeight > containerHeight) {
          displayHeight = containerHeight;
          displayWidth = displayHeight * imageAspect;
        }
        
        setDisplaySize({ width: displayWidth, height: displayHeight });
        
        // Center the crop area
        const cropSize = Math.min(displayWidth, displayHeight) * 0.6;
        setCropData({
          x: (displayWidth - cropSize) / 2,
          y: (displayHeight - cropSize) / 2,
          width: cropSize,
          height: cropSize
        });
        
        setImageElement(img);
        setIsReady(true);
      };
      
      img.onerror = () => {
        console.error('❌ Failed to load image for crop');
        toast.error('Failed to load image for cropping');
      };
      
      img.src = imageUrl;
    } else if (!open) {
      setIsReady(false);
      setImageElement(null);
    }
  }, [open, imageUrl]);

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
      const newX = Math.max(0, Math.min(x - cropData.width / 2, displaySize.width - cropData.width));
      const newY = Math.max(0, Math.min(y - cropData.height / 2, displaySize.height - cropData.height));
      setCropData(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      let newCrop = { ...cropData };
      
      if (resizeHandle.includes('right')) {
        newCrop.width = Math.max(50, Math.min(x - cropData.x, displaySize.width - cropData.x));
      }
      if (resizeHandle.includes('bottom')) {
        newCrop.height = Math.max(50, Math.min(y - cropData.y, displaySize.height - cropData.y));
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
      if (selectedRatio !== null && selectedRatio > 0) {
        if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
          newCrop.height = newCrop.width / selectedRatio;
        } else {
          newCrop.width = newCrop.height * selectedRatio;
        }
        
        // Ensure crop doesn't exceed boundaries after ratio adjustment
        if (newCrop.x + newCrop.width > displaySize.width) {
          newCrop.width = displaySize.width - newCrop.x;
          newCrop.height = newCrop.width / selectedRatio;
        }
        if (newCrop.y + newCrop.height > displaySize.height) {
          newCrop.height = displaySize.height - newCrop.y;
          newCrop.width = newCrop.height * selectedRatio;
        }
      }

      setCropData(newCrop);
    }
  }, [isDragging, isResizing, cropData, displaySize, selectedRatio, resizeHandle]);

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
    console.log('Aspect ratio changed to:', ratio);
    setSelectedRatio(ratio);
    
    // Only apply constraint if ratio is not null (freeform)
    if (ratio !== null && ratio > 0) {
      console.log('Applying aspect ratio constraint:', ratio);
      const newHeight = cropData.width / ratio;
      const maxHeight = displaySize.height - cropData.y;
      
      if (newHeight <= maxHeight) {
        setCropData(prev => ({ ...prev, height: newHeight }));
      } else {
        const newWidth = maxHeight * ratio;
        setCropData(prev => ({ ...prev, width: newWidth, height: maxHeight }));
      }
    } else {
      console.log('Freeform mode - no aspect ratio constraint');
    }
  };

  const cropAndUploadImage = async () => {
    if (!imageElement || !canvasRef.current) {
      console.error('Missing imageElement or canvas');
      toast.error('Missing image or canvas element');
      return;
    }

    console.log('🔄 Starting crop and upload...');
    setIsProcessing(true);
    
    try {
      // Create a new image with proper CORS settings
      const corsImage = new Image();
      corsImage.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        corsImage.onload = () => resolve();
        corsImage.onerror = () => reject(new Error('Failed to load CORS image'));
        corsImage.src = imageUrl;
      });
      
      console.log('✅ CORS image loaded successfully');
      
      console.log('Canvas and context setup...');
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      console.log('Image dimensions:', corsImage.naturalWidth, 'x', corsImage.naturalHeight);
      console.log('Display dimensions:', displaySize.width, 'x', displaySize.height);
      console.log('Crop data:', cropData);

      // Calculate scale factor between display size and natural size
      const scaleX = corsImage.naturalWidth / displaySize.width;
      const scaleY = corsImage.naturalHeight / displaySize.height;
      
      console.log('Scale factors:', { scaleX, scaleY });

      // Set canvas size to crop dimensions in natural image coordinates
      const cropWidth = cropData.width * scaleX;
      const cropHeight = cropData.height * scaleY;
      
      console.log('Crop dimensions in natural scale:', { cropWidth, cropHeight });
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      console.log('Drawing cropped image to canvas...');
      // Draw the cropped portion using CORS image
      ctx.drawImage(
        corsImage,
        cropData.x * scaleX, // source x
        cropData.y * scaleY, // source y
        cropWidth, // source width
        cropHeight, // source height
        0, // destination x
        0, // destination y
        cropWidth, // destination width
        cropHeight // destination height
      );

      console.log('Converting canvas to blob...');
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Blob created successfully, size:', blob.size);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.9);
      });

      console.log('Getting user session...');
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      console.log('Preparing file for upload...');
      // Create file from blob for upload
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading to Supabase...');

      // Upload using file-upload function
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

  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Aspect Ratio Controls */}
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

          {/* Crop Area */}
          <div className="relative border border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center" style={{ height: 450 }}>
            {isReady ? (
              <div
                ref={containerRef}
                className="relative"
                style={{
                  width: displaySize.width,
                  height: displaySize.height,
                }}
              >
                {/* Image */}
                <img
                  src={imageUrl}
                  alt="Crop preview"
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable={false}
                />
                
                {/* Crop overlay */}
                <div
                  className="absolute border-2 border-primary bg-primary/20 cursor-move"
                  style={{
                    left: cropData.x,
                    top: cropData.y,
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
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>

          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={cropAndUploadImage} disabled={isProcessing || !isReady}>
              {isProcessing ? 'Processing...' : 'Crop & Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};