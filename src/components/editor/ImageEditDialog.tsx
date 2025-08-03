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
      // Initialize crop area to center 80% of image
      setCropData({
        x: 10,
        y: 10,
        width: 80,
        height: 80
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
            
            {showCrop && (
              <div className="space-y-3 p-3 border rounded">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X Position (%)</Label>
                    <Slider
                      value={[cropData.x]}
                      onValueChange={(value) => setCropData({...cropData, x: value[0]})}
                      max={100 - cropData.width}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y Position (%)</Label>
                    <Slider
                      value={[cropData.y]}
                      onValueChange={(value) => setCropData({...cropData, y: value[0]})}
                      max={100 - cropData.height}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Width (%)</Label>
                    <Slider
                      value={[cropData.width]}
                      onValueChange={(value) => setCropData({...cropData, width: value[0]})}
                      min={10}
                      max={100 - cropData.x}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height (%)</Label>
                    <Slider
                      value={[cropData.height]}
                      onValueChange={(value) => setCropData({...cropData, height: value[0]})}
                      min={10}
                      max={100 - cropData.y}
                      step={1}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={applyCrop} className="w-full">
                  Apply Crop
                </Button>
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