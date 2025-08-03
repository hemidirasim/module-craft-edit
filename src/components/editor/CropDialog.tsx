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
import { Crop, Square, Monitor, Smartphone, Upload } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMode, setUploadMode] = useState<'crop' | 'upload'>('crop');
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    width: 200,
    height: 200
  });

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageElement && containerRef.current && open) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxWidth = Math.min(500, containerRect.width - 40);
      const maxHeight = 400;
      
      const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
      let displayWidth = maxWidth;
      let displayHeight = displayWidth / aspectRatio;
      
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = displayHeight * aspectRatio;
      }
      
      setImageSize({ width: displayWidth, height: displayHeight });
      
      // Initialize crop to center
      const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
      setCropData({
        x: (displayWidth - initialSize) / 2,
        y: (displayHeight - initialSize) / 2,
        width: initialSize,
        height: initialSize
      });
    }
  }, [imageElement, open]);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://qgmluixnzhpthywyrytn.supabase.co/functions/v1/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      toast.success('Image uploaded successfully!');
      onApplyChanges(result.url);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsProcessing(false);
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
      const scaleX = imageElement.naturalWidth / imageSize.width;
      const scaleY = imageElement.naturalHeight / imageSize.height;

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

      // Create file from blob for upload
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://qgmluixnzhpthywyrytn.supabase.co/functions/v1/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      toast.success('Image cropped and uploaded successfully!');
      onApplyChanges(result.url);
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
          <DialogTitle>Image Options</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mode selection */}
          <div className="flex gap-2">
            <Button
              variant={uploadMode === 'upload' ? 'default' : 'outline'}
              onClick={() => setUploadMode('upload')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Image
            </Button>
            <Button
              variant={uploadMode === 'crop' ? 'default' : 'outline'}
              onClick={() => setUploadMode('crop')}
              className="flex-1"
              disabled={!imageElement}
            >
              <Crop className="w-4 h-4 mr-2" />
              Crop Existing
            </Button>
          </div>

          {uploadMode === 'upload' ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Upload Image</p>
              <p className="text-muted-foreground mb-4">
                Select an image file to upload directly to server
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Uploading...' : 'Choose File'}
              </Button>
            </div>
          ) : (
            <>
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

              {imageElement && (
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
              )}
            </>
          )}

          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {uploadMode === 'crop' && (
              <Button onClick={cropAndUploadImage} disabled={isProcessing || !imageElement}>
                {isProcessing ? 'Processing...' : 'Crop & Upload'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};