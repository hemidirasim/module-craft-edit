import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Code, Youtube, X } from "lucide-react";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertMedia: (mediaData: { type: 'video' | 'embed'; content: string; width?: string; height?: string }) => void;
}

export const MediaDialog = ({ open, onOpenChange, onInsertMedia }: MediaDialogProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [mediaWidth, setMediaWidth] = useState("");
  const [mediaHeight, setMediaHeight] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setVideoUrl("");
      setEmbedCode("");
      setMediaWidth("");
      setMediaHeight("");
      setPreviewUrl("");
      
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

  const handleClose = () => {
    setVideoUrl("");
    setEmbedCode("");
    setMediaWidth("");
    setMediaHeight("");
    setPreviewUrl("");
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
        
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Youtube size={16} />
              Video URL
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code size={16} />
              Embed Code
            </TabsTrigger>
          </TabsList>
          
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
                      setMediaWidth(value);
                      
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
                      setMediaHeight(value);
                      
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
        {(previewUrl || (embedCode && isValidEmbedCode(embedCode))) && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded p-4 bg-muted/50">
              {previewUrl ? (
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
            onClick={videoUrl ? handleInsertVideo : handleInsertEmbed}
            disabled={!embedCode.trim() || !isValidEmbedCode(embedCode)}
          >
            <Play size={16} className="mr-2" />
            Insert Media
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};