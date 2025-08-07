import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Code, Youtube, X, Image, Files } from "lucide-react";
import { FileManagerDialog } from "./FileManagerDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertMedia: (mediaData: { type: 'video' | 'embed' | 'image'; content: string; width?: string; height?: string; alt?: string }) => void;
}

export const MediaDialog = ({ open, onOpenChange, onInsertMedia }: MediaDialogProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [mediaWidth, setMediaWidth] = useState("");
  const [mediaHeight, setMediaHeight] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showFileManager, setShowFileManager] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setVideoUrl("");
      setEmbedCode("");
      setMediaWidth("");
      setMediaHeight("");
      setPreviewUrl("");
      setSelectedImageFile(null);
      
      setTimeout(() => {
        if (urlInputRef.current) {
          urlInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const extractVideoId = (url: string) => {
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return { platform: 'youtube', id: youtubeMatch[1] };
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/i;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return { platform: 'vimeo', id: vimeoMatch[1] };
    }

    return null;
  };

  const generateEmbedCode = (videoInfo: { platform: string; id: string }) => {
    // Format dimensions to include 'px' if it's a number, otherwise use as-is (for percentages)
    const formatDimension = (value: string) => {
      const trimmedValue = value.trim();
      console.log('Testing value:', `"${trimmedValue}"`, 'Length:', trimmedValue.length);
      console.log('Is pure number?', /^\d+$/.test(trimmedValue));
      
      // If it's just a number without any unit, add px
      if (/^\d+$/.test(trimmedValue)) {
        console.log('Adding px to pure number');
        return trimmedValue + 'px';
      }
      // For everything else (including percentages like "100%"), use as-is
      console.log('Using as-is');
      return trimmedValue;
    };

    const width = formatDimension(mediaWidth);
    const height = formatDimension(mediaHeight);

    switch (videoInfo.platform) {
      case 'youtube':
        return `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoInfo.id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      case 'vimeo':
        return `<iframe src="https://player.vimeo.com/video/${videoInfo.id}" width="${width}" height="${height}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      default:
        return '';
    }
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    const videoInfo = extractVideoId(url);
    if (videoInfo) {
      // URL dəyişəndə mövcud width/height qalsın, reset etməsin
      updateEmbedCode(videoInfo);
      
      // Generate preview URL
      if (videoInfo.platform === 'youtube') {
        setPreviewUrl(`https://img.youtube.com/vi/${videoInfo.id}/maxresdefault.jpg`);
      } else if (videoInfo.platform === 'vimeo') {
        setPreviewUrl(''); // Vimeo thumbnails require API call
      }
    } else {
      setEmbedCode('');
      setPreviewUrl('');
    }
  };

  const updateEmbedCode = (videoInfo: { platform: string; id: string }) => {
    const embed = generateEmbedCode(videoInfo);
    setEmbedCode(embed);
  };

  const handleDimensionChange = () => {
    const videoInfo = extractVideoId(videoUrl);
    if (videoInfo) {
      updateEmbedCode(videoInfo);
    }
  };

  const handleInsertVideo = () => {
    if (!embedCode.trim()) return;
    
    onInsertMedia({
      type: 'video',
      content: embedCode.trim(),
      width: mediaWidth,
      height: mediaHeight
    });
    
    handleClose();
  };

  const handleInsertEmbed = () => {
    if (!embedCode.trim()) return;
    
    onInsertMedia({
      type: 'embed',
      content: embedCode.trim()
    });
    
    handleClose();
  };

  const handleInsertImage = () => {
    if (!selectedImageFile) return;
    
    onInsertMedia({
      type: 'image',
      content: selectedImageFile.signedUrl,
      width: mediaWidth,
      height: mediaHeight,
      alt: selectedImageFile.original_name.replace(/\.[^/.]+$/, "")
    });
    
    handleClose();
  };

  const handleFileSelect = async (file: any) => {
    if (file.file_type === 'image') {
      try {
        // Get signed URL for the selected file
        const { data, error } = await supabase.storage
          .from('user-files')
          .createSignedUrl(file.storage_path, 3600);

        if (error) throw error;

        setSelectedImageFile({
          ...file,
          signedUrl: data.signedUrl
        });
        setPreviewUrl(data.signedUrl);
        toast.success('Image selected successfully');
      } catch (error) {
        console.error('Error getting signed URL:', error);
        toast.error('Failed to load image');
      }
    } else {
      toast.error('Please select an image file');
    }
  };

  const handleClose = () => {
    setVideoUrl("");
    setEmbedCode("");
    setMediaWidth("");
    setMediaHeight("");
    setPreviewUrl("");
    setSelectedImageFile(null);
    onOpenChange(false);
  };

  const isValidVideoUrl = (url: string) => {
    return extractVideoId(url) !== null;
  };

  const isValidEmbedCode = (code: string) => {
    return code.includes('<iframe') || code.includes('<embed') || code.includes('<video');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play size={20} />
            Insert Media
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image size={16} />
              Image Files
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Youtube size={16} />
              Video URL
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code size={16} />
              Embed Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="space-y-4">
            <div className="text-center p-8 border border-dashed border-border rounded-lg">
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Select Image from File Manager</p>
              <p className="text-muted-foreground mb-4">
                Choose an image file to insert as media content
              </p>
              <Button onClick={() => setShowFileManager(true)}>
                <Files className="w-4 h-4 mr-2" />
                Open File Manager
              </Button>
            </div>
            
            {selectedImageFile && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image-width">Width</Label>
                  <Input
                    id="image-width"
                    value={mediaWidth}
                    onChange={(e) => setMediaWidth(e.target.value)}
                    placeholder="Auto or 300px or 50%"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-height">Height</Label>
                  <Input
                    id="image-height"
                    value={mediaHeight}
                    onChange={(e) => setMediaHeight(e.target.value)}
                    placeholder="Auto or 200px or 50%"
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                ref={urlInputRef}
                id="video-url"
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              />
              {videoUrl && !isValidVideoUrl(videoUrl) && (
                <p className="text-sm text-destructive">Please enter a valid YouTube or Vimeo URL</p>
              )}
              <p className="text-sm text-muted-foreground">
                Supports YouTube and Vimeo URLs
              </p>
            </div>

            {isValidVideoUrl(videoUrl) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video-width">Width</Label>
                  <Input
                    id="video-width"
                    value={mediaWidth}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Hack: boşluq əlavə edib sil
                      setMediaWidth(value + " ");
                      setTimeout(() => setMediaWidth(value), 1);
                      
                      const videoInfo = extractVideoId(videoUrl);
                      if (videoInfo) {
                        const embed = generateEmbedCode(videoInfo);
                        setEmbedCode(embed);
                      }
                    }}
                    onBlur={() => {
                      const videoInfo = extractVideoId(videoUrl);
                      if (videoInfo) {
                        const embed = generateEmbedCode(videoInfo);
                        setEmbedCode(embed);
                      }
                    }}
                    placeholder="560px or 100%"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter pixel values (e.g., 560) or percentage (e.g., 100%)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-height">Height</Label>
                  <Input
                    id="video-height"
                    value={mediaHeight}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Hack: boşluq əlavə edib sil
                      setMediaHeight(value + " ");
                      setTimeout(() => setMediaHeight(value), 1);
                      
                      const videoInfo = extractVideoId(videoUrl);
                      if (videoInfo) {
                        const embed = generateEmbedCode(videoInfo);
                        setEmbedCode(embed);
                      }
                    }}
                    onBlur={() => {
                      const videoInfo = extractVideoId(videoUrl);
                      if (videoInfo) {
                        const embed = generateEmbedCode(videoInfo);
                        setEmbedCode(embed);
                      }
                    }}
                    placeholder="315px or 100%"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter pixel values (e.g., 315) or percentage (e.g., 100%)
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed Code</Label>
              <Textarea
                id="embed-code"
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                placeholder="Paste your embed code here (iframe, embed, video tags, etc.)"
                rows={6}
              />
              {embedCode && !isValidEmbedCode(embedCode) && (
                <p className="text-sm text-destructive">Please enter valid embed code (iframe, embed, or video tags)</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {(previewUrl || (embedCode && isValidEmbedCode(embedCode)) || selectedImageFile) && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded p-4 bg-muted/50">
              {selectedImageFile ? (
                <div className="flex justify-center">
                  <img
                    src={selectedImageFile.signedUrl}
                    alt="Selected image"
                    className="max-w-full max-h-48 object-contain"
                  />
                </div>
              ) : previewUrl ? (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Video preview"
                    className="max-w-full max-h-48 object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="bg-background rounded border"
                  dangerouslySetInnerHTML={{ __html: embedCode }}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={handleClose} variant="outline">
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={
              selectedImageFile ? handleInsertImage :
              videoUrl ? handleInsertVideo : 
              handleInsertEmbed
            }
            disabled={
              selectedImageFile ? false :
              !embedCode.trim() || !isValidEmbedCode(embedCode)
            }
          >
            <Play size={16} className="mr-2" />
            Insert Media
          </Button>
        </div>
        
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