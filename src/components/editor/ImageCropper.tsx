import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Crop, Square, Monitor, Smartphone } from "lucide-react";

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

interface ImageCropperProps {
  imageElement: HTMLImageElement | null;
  onCropChange: (cropData: CropData | null) => void;
  className?: string;
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

export const ImageCropper = ({ imageElement, onCropChange, className }: ImageCropperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    width: 200,
    height: 200
  });

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxWidth = Math.min(400, containerRect.width - 40);
      const maxHeight = 300;
      
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
  }, [imageElement, isEnabled]);

  const updateCrop = useCallback((newCropData: CropData) => {
    setCropData(newCropData);
    if (isEnabled) {
      // Convert to relative coordinates (0-1)
      const relativeCrop = {
        x: newCropData.x / imageSize.width,
        y: newCropData.y / imageSize.height,
        width: newCropData.width / imageSize.width,
        height: newCropData.height / imageSize.height
      };
      onCropChange(relativeCrop);
    }
  }, [imageSize, isEnabled, onCropChange]);

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
      updateCrop({ ...cropData, x: newX, y: newY });
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

      updateCrop(newCrop);
    }
  }, [isDragging, isResizing, cropData, imageSize, selectedRatio, resizeHandle, updateCrop]);

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
        updateCrop({ ...cropData, height: newHeight });
      } else {
        const newWidth = maxHeight * ratio;
        updateCrop({ ...cropData, width: newWidth, height: maxHeight });
      }
    }
  };

  const toggleCrop = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    
    if (newEnabled) {
      onCropChange(cropData);
    } else {
      onCropChange(null);
    }
  };

  if (!imageElement) return null;

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleCrop}
          >
            <Crop className="w-4 h-4 mr-2" />
            Crop
          </Button>
          {isEnabled && (
            <span className="text-sm text-muted-foreground">
              Click and drag to position, resize handles to adjust
            </span>
          )}
        </div>

        {isEnabled && (
          <>
            <div>
              <Label className="text-sm font-medium mb-2 block">Aspect Ratio</Label>
              <div className="grid grid-cols-3 gap-2">
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
                ref={cropRef}
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
          </>
        )}
      </div>
    </div>
  );
};