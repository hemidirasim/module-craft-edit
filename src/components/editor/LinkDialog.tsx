import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link, ExternalLink, X } from "lucide-react";

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertLink: (linkData: { text: string; url: string; target?: string; title?: string }) => void;
  selectedText?: string;
}

export const LinkDialog = ({ open, onOpenChange, onInsertLink, selectedText = "" }: LinkDialogProps) => {
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLinkText(selectedText);
      setLinkUrl("");
      setLinkTitle("");
      setOpenInNewTab(false);
      
      setTimeout(() => {
        if (selectedText && textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
    }
  }, [open, selectedText]);

  const handleInsert = () => {
    if (!linkText.trim() || !linkUrl.trim()) return;
    
    onInsertLink({
      text: linkText.trim(),
      url: linkUrl.trim(),
      target: openInNewTab ? "_blank" : undefined,
      title: linkTitle.trim() || undefined
    });
    
    handleClose();
  };

  const handleClose = () => {
    setLinkText("");
    setLinkUrl("");
    setLinkTitle("");
    setOpenInNewTab(false);
    onOpenChange(false);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link size={20} />
            Insert Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-text">Display Text</Label>
            <Input
              ref={textInputRef}
              id="link-text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Enter the text to display"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleInsert();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <div className="flex gap-2">
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleInsert();
                  }
                }}
              />
              {linkUrl && isValidUrl(linkUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(formatUrl(linkUrl), '_blank')}
                  title="Test link"
                >
                  <ExternalLink size={16} />
                </Button>
              )}
            </div>
            {linkUrl && !isValidUrl(linkUrl) && (
              <p className="text-sm text-destructive">Please enter a valid URL</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-title">Title (optional)</Label>
            <Input
              id="link-title"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Tooltip text when hovering over link"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="new-tab"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
            />
            <Label htmlFor="new-tab">Open in new tab</Label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button onClick={handleClose} variant="outline">
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleInsert} 
              disabled={!linkText.trim() || !linkUrl.trim() || !isValidUrl(linkUrl)}
            >
              <Link size={16} className="mr-2" />
              Insert Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};