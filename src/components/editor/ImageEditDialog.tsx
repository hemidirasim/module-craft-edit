import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RotateCw, AlignLeft, AlignCenter, AlignRight, Crop } from "lucide-react";

interface ImageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageElement: HTMLImageElement | null;
  onApplyChanges: (changes: ImageChanges) => void;
}

interface ImageChanges {
  width?: string;
  rotation?: number;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
  alt?: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    imageUrl?: string;
  };
}

export const ImageEditDialog = ({ 
  open, 
  onOpenChange, 
  imageElement, 
  onApplyChanges 
}: ImageEditDialogProps) => {
  const [width, setWidth] = useState<string>("");
  const [rotation, setRotation] = useState<number>(0);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [caption, setCaption] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [showCrop, setShowCrop] = useState<boolean>(false);
  const [cropData, setCropData] = useState<{x: number, y: number, width: number, height: number}>({x: 0, y: 0, width: 100, height: 100});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [imageDisplaySize, setImageDisplaySize] = useState<{width: number, height: number}>({width: 0, height: 0});

  useEffect(() => {
    if (imageElement && open) {
      // Get current image properties
      const currentWidth = imageElement.style.width || imageElement.width + 'px';
      setWidth(currentWidth.replace('px', ''));
      
      // Get rotation from transform
      const transform = imageElement.style.transform;
      const rotateMatch = transform.match(/rotate\((\d+)deg\)/);
      setRotation(rotateMatch ? parseInt(rotateMatch[1]) : 0);
      
      // Get alignment from parent or image style
      const parent = imageElement.parentElement;
      const textAlign = parent?.style.textAlign || 'center';
      setAlignment(textAlign as 'left' | 'center' | 'right');
      
      // Get caption from next sibling or figure caption
      const figure = imageElement.closest('figure');
      const figcaption = figure?.querySelector('figcaption');
      setCaption(figcaption?.textContent || '');
      
      // Get alt text
      setAlt(imageElement.alt || '');
      
      // Store original width for percentage calculations
      setOriginalWidth(imageElement.naturalWidth);
      
      // Calculate display size for crop overlay
      const displayWidth = Math.min(400, imageElement.naturalWidth);
      const displayHeight = (displayWidth / imageElement.naturalWidth) * imageElement.naturalHeight;
      setImageDisplaySize({ width: displayWidth, height: displayHeight });
    }
  }, [imageElement, open]);

  const handleApply = () => {
    const changes: ImageChanges = {
      width: width + 'px',
      rotation,
      alignment,
      caption,
      alt,
      cropData: showCrop && croppedImageUrl ? { 
        x: cropData.x, 
        y: cropData.y, 
        width: cropData.width, 
        height: cropData.height,
        imageUrl: croppedImageUrl 
      } : undefined
    };
    
    onApplyChanges(changes);
    onOpenChange(false);
  };

  const handleWidthChange = (value: string) => {
    setWidth(value);
  };

  const handleRotationChange = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const getWidthPercentage = () => {
    if (!originalWidth || !width) return 100;
    return Math.round((parseInt(width) / originalWidth) * 100);
  };

  const setWidthByPercentage = (percentage: number) => {
    if (originalWidth) {
      setWidth(Math.round((originalWidth * percentage) / 100).toString());
    }
  };

  const handleCropToggle = () => {
    setShowCrop(!showCrop);
    if (!showCrop && imageElement) {
      // Initialize crop area to center 50% of image
      setCropData({
        x: 25,
        y: 25,
        width: 50,
        height: 50
      });
    }
  };

  const applyCrop = () => {
    if (!imageElement || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgWidth = imageElement.naturalWidth;
    const imgHeight = imageElement.naturalHeight;
    
    // Calculate actual crop dimensions
    const cropX = (cropData.x / 100) * imgWidth;
    const cropY = (cropData.y / 100) * imgHeight;
    const cropWidth = (cropData.width / 100) * imgWidth;
    const cropHeight = (cropData.height / 100) * imgHeight;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    ctx.drawImage(
      imageElement,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    setCroppedImageUrl(canvas.toDataURL());
  };

  const handleCropMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    if (action === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(100 - cropData.width, cropData.x + (deltaX / imageDisplaySize.width) * 100));
      const newY = Math.max(0, Math.min(100 - cropData.height, cropData.y + (deltaY / imageDisplaySize.height) * 100));
      
      setCropData({ ...cropData, x: newX, y: newY });
      setDragStart({ x, y });
    } else if (isResizing) {
      const newWidth = Math.max(10, Math.min(100 - cropData.x, cropData.width + (deltaX / imageDisplaySize.width) * 100));
      const newHeight = Math.max(10, Math.min(100 - cropData.y, cropData.height + (deltaY / imageDisplaySize.height) * 100));
      
      setCropData({ ...cropData, width: newWidth, height: newHeight });
      setDragStart({ x, y });
    }
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Image Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Width Control */}
          <div className="space-y-2">
            <Label>Width</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                placeholder="Pixels"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWidthByPercentage(25)}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWidthByPercentage(50)}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWidthByPercentage(75)}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWidthByPercentage(100)}
              >
                100%
              </Button>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <Label>Rotation</Label>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotationChange(-90)}
              >
                <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
              </Button>
              <span className="flex-1 text-center text-sm">{rotation}°</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotationChange(90)}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            <Slider
              value={[rotation]}
              onValueChange={(value) => setRotation(value[0])}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          {/* Alignment Control */}
          <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-1">
              <Button
                variant={alignment === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAlignment('left')}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={alignment === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAlignment('center')}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={alignment === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAlignment('right')}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Crop Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Crop</Label>
              <Button
                variant={showCrop ? "default" : "outline"}
                size="sm"
                onClick={handleCropToggle}
              >
                <Crop className="w-4 h-4" />
              </Button>
            </div>
            
            {showCrop && imageElement && (
              <div className="space-y-3 p-3 border rounded">
                <div className="relative bg-gray-100 rounded overflow-hidden" style={{ width: imageDisplaySize.width, height: imageDisplaySize.height }}>
                  {/* Image preview */}
                  <img 
                    src={imageElement.src} 
                    alt="Crop preview"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                  
                  {/* Crop overlay */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onMouseMove={handleCropMouseMove}
                    onMouseUp={handleCropMouseUp}
                    onMouseLeave={handleCropMouseUp}
                  >
                    {/* Crop area */}
                    <div
                      className="absolute border-2 border-white bg-transparent cursor-move"
                      style={{
                        left: `${cropData.x}%`,
                        top: `${cropData.y}%`,
                        width: `${cropData.width}%`,
                        height: `${cropData.height}%`,
                      }}
                      onMouseDown={(e) => handleCropMouseDown(e, 'drag')}
                    >
                      {/* Clear area inside crop */}
                      <div className="absolute inset-0 bg-white bg-opacity-0" />
                      
                      {/* Resize handle */}
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-400 cursor-se-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleCropMouseDown(e, 'resize');
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" onClick={applyCrop} className="flex-1">
                    Apply Crop
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCrop(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label>Caption</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter image caption..."
              rows={2}
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label>Alt Text</Label>
            <Input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Enter image description..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
        
        {/* Hidden canvas for crop functionality */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
};