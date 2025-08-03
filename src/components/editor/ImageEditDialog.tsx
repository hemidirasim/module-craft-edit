import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { RotateCw, AlignLeft, AlignCenter, AlignRight, Crop } from "lucide-react";
import { CropDialog } from "./CropDialog";
import { toast } from "sonner";

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
  newSrc?: string;
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
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [newImageSrc, setNewImageSrc] = useState<string>("");
  const [currentImageElement, setCurrentImageElement] = useState<HTMLImageElement | null>(null);

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
      newSrc: newImageSrc || undefined
    };
    
    onApplyChanges(changes);
    onOpenChange(false);
  };

  const handleCropComplete = (croppedImageSrc: string) => {
    setNewImageSrc(croppedImageSrc);
  };

  const handleCrop = () => {
    console.log('=== IMAGE EDIT DIALOG CROP ===');
    console.log('Image element:', imageElement);
    console.log('Image src:', imageElement?.src);
    
    if (imageElement) {
      console.log('Creating new image element from existing...');
      const img = document.createElement('img');
      
      // Remove crossOrigin for same-origin images  
      // img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Image edit dialog - Image loaded!');
        console.log('Natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
        setCurrentImageElement(img);
        setShowCropDialog(true);
      };
      
      img.onerror = (error) => {
        console.error('❌ Image edit dialog - Failed to load:', error);
        toast.error('Failed to load image for cropping');
      };
      
      img.src = imageElement.src;
    } else {
      console.log('❌ No image element selected');
      toast.error('No image selected');
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Parameters</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Crop Section */}
          <div className="border-b pb-6">
            <Button
              variant="outline"
              onClick={handleCrop}
              className="w-full"
            >
              <Crop className="w-4 h-4 mr-2" />
              Crop Image
            </Button>
            {newImageSrc && (
              <p className="text-sm text-muted-foreground mt-2">
                Image has been cropped and will be updated when you apply changes.
              </p>
            )}
          </div>
          
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
        
        <CropDialog
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageUrl={imageElement?.src || ''}
          onApplyChanges={handleCropComplete}
        />
      </DialogContent>
    </Dialog>
  );
};