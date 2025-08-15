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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight, Crop, Type, WrapText, FileImage } from "lucide-react";
import { CropDialog } from "./CropDialog";
import { FileManagerDialog } from "./FileManagerDialog";
// import { supabase } from "@/integrations/supabase/client"; // Deprecated - using new auth system
import { toast } from "sonner";

interface ImageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageElement: HTMLImageElement | null;
  onApplyChanges: (changes: ImageChanges) => void;
}

interface ImageChanges {
  width?: string;
  height?: string;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
  alt?: string;
  newSrc?: string;
  textWrap?: 'none' | 'left' | 'right';
}

export const ImageEditDialog = ({ 
  open, 
  onOpenChange, 
  imageElement, 
  onApplyChanges 
}: ImageEditDialogProps) => {
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [widthUnit, setWidthUnit] = useState<'px' | '%' | 'auto'>('px');
  const [heightUnit, setHeightUnit] = useState<'px' | '%' | 'auto'>('auto');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [textWrap, setTextWrap] = useState<'none' | 'left' | 'right'>('none');
  const [caption, setCaption] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [newImageSrc, setNewImageSrc] = useState<string>("");
  const [currentImageElement, setCurrentImageElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageElement && open) {
      // Get current image properties
      const currentWidth = imageElement.style.width || imageElement.width + 'px';
      const currentHeight = imageElement.style.height || imageElement.height + 'px';
      
      // Parse width and height values with units
      if (currentWidth === 'auto' || currentWidth.includes('auto')) {
        setWidth("");
        setWidthUnit('auto');
      } else {
        const widthMatch = currentWidth.match(/^(\d+)(.*)$/);
        if (widthMatch) {
          setWidth(widthMatch[1]);
          setWidthUnit(widthMatch[2].includes('%') ? '%' : 'px');
        }
      }
      
      if (currentHeight === 'auto' || currentHeight.includes('auto')) {
        setHeight("");
        setHeightUnit('auto');
      } else {
        const heightMatch = currentHeight.match(/^(\d+)(.*)$/);
        if (heightMatch) {
          setHeight(heightMatch[1]);
          setHeightUnit(heightMatch[2].includes('%') ? '%' : 'px');
        }
      }
      
      // Get alignment from parent or image style
      const parent = imageElement.parentElement;
      const textAlign = parent?.style.textAlign || 'center';
      setAlignment(textAlign as 'left' | 'center' | 'right');
      
      // Get text wrap setting from image style
      const float = imageElement.style.float || 'none';
      setTextWrap(float as 'none' | 'left' | 'right');
      
      // Get caption from next sibling or figure caption
      const figure = imageElement.closest('figure');
      const figcaption = figure?.querySelector('figcaption');
      setCaption(figcaption?.textContent || '');
      
      // Get alt text
      setAlt(imageElement.alt || '');
      
      // Store original dimensions for percentage calculations
      setOriginalWidth(imageElement.naturalWidth);
      setOriginalHeight(imageElement.naturalHeight);
    }
  }, [imageElement, open]);

  const handleApply = () => {
    const changes: ImageChanges = {
      width: widthUnit === 'auto' ? 'auto' : (width ? width + widthUnit : undefined),
      height: heightUnit === 'auto' ? 'auto' : (height ? height + heightUnit : undefined),
      alignment,
      textWrap,
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

  const handleReplaceImage = async (file: any) => {
    if (file.file_type === 'image') {
      try {
        console.log('Selected file for replacement:', file);
        
        // Use Supabase client to get signed URL
        const { data, error } = await supabase.storage
          .from('user-files')
          .createSignedUrl(file.storage_path, 3600);

        if (error) {
          console.error('Supabase storage error:', error);
          throw error;
        }

        console.log('New image URL:', data.signedUrl);
        setNewImageSrc(data.signedUrl);
        setAlt(file.original_name.replace(/\.[^/.]+$/, ""));
        toast.success('Image selected for replacement');
      } catch (error) {
        console.error('Error getting signed URL:', error);
        toast.error('Failed to load replacement image');
      }
    } else {
      toast.error('Please select an image file');
    }
  };

  const convertWidthToPixels = (value: string, unit: 'px' | '%' | 'auto') => {
    if (unit === '%' && originalWidth) {
      return Math.round((originalWidth * parseInt(value)) / 100).toString();
    }
    return value;
  };

  const convertHeightToPixels = (value: string, unit: 'px' | '%' | 'auto') => {
    if (unit === '%' && originalHeight) {
      return Math.round((originalHeight * parseInt(value)) / 100).toString();
    }
    return value;
  };

  const convertWidthToPercent = (value: string, unit: 'px' | '%' | 'auto') => {
    if (unit === 'px' && originalWidth) {
      return Math.round((parseInt(value) / originalWidth) * 100).toString();
    }
    return value;
  };

  const convertHeightToPercent = (value: string, unit: 'px' | '%' | 'auto') => {
    if (unit === 'px' && originalHeight) {
      return Math.round((parseInt(value) / originalHeight) * 100).toString();
    }
    return value;
  };

  const handleWidthUnitChange = (newUnit: 'px' | '%' | 'auto') => {
    if (newUnit === 'auto') {
      setWidth("");
    } else if (width && (widthUnit === 'px' || widthUnit === '%')) {
      if (newUnit === 'px' && widthUnit === '%') {
        setWidth(convertWidthToPixels(width, widthUnit));
      } else if (newUnit === '%' && widthUnit === 'px') {
        setWidth(convertWidthToPercent(width, widthUnit));
      }
    }
    setWidthUnit(newUnit);
  };

  const handleHeightUnitChange = (newUnit: 'px' | '%' | 'auto') => {
    if (newUnit === 'auto') {
      setHeight("");
    } else if (height && (heightUnit === 'px' || heightUnit === '%')) {
      if (newUnit === 'px' && heightUnit === '%') {
        setHeight(convertHeightToPixels(height, heightUnit));
      } else if (newUnit === '%' && heightUnit === 'px') {
        setHeight(convertHeightToPercent(height, heightUnit));
      }
    }
    setHeightUnit(newUnit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Parameters</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Replace Image Section */}
          <div className="border-b pb-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCrop}
                className="flex-1"
              >
                <Crop className="w-4 h-4 mr-2" />
                Crop Image
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFileManager(true)}
                className="flex-1"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Replace Image
              </Button>
            </div>
            {newImageSrc && (
              <p className="text-sm text-muted-foreground mt-2">
                Image will be replaced when you apply changes.
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
                onChange={(e) => setWidth(e.target.value)}
                placeholder="Width"
                className="flex-1"
                disabled={widthUnit === 'auto'}
              />
              <Select value={widthUnit} onValueChange={handleWidthUnitChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="px">px</SelectItem>
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="auto">auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Height Control */}
          <div className="space-y-2">
            <Label>Height</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height"
                className="flex-1"
                disabled={heightUnit === 'auto'}
              />
              <Select value={heightUnit} onValueChange={handleHeightUnitChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="px">px</SelectItem>
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="auto">auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alignment Control - Only show when text wrap is none */}
          {textWrap === 'none' && (
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
          )}

          {/* Text Wrap Control */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <WrapText className="w-4 h-4" />
              Text Wrap
            </Label>
            <div className="flex gap-1">
              <Button
                variant={textWrap === 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTextWrap('none')}
                className="flex-1"
              >
                <Type className="w-4 h-4 mr-1" />
                None
              </Button>
              <Button
                variant={textWrap === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTextWrap('left')}
                className="flex-1"
              >
                <AlignLeft className="w-4 h-4 mr-1" />
                Left
              </Button>
              <Button
                variant={textWrap === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTextWrap('right')}
                className="flex-1"
              >
                <AlignRight className="w-4 h-4 mr-1" />
                Right
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Text wrap allows text to flow around the image on the selected side
            </p>
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
        
        <FileManagerDialog
          open={showFileManager}
          onOpenChange={setShowFileManager}
          onSelectFile={handleReplaceImage}
          fileTypeFilter="image"
        />
      </DialogContent>
    </Dialog>
  );
};