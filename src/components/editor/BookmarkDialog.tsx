import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Hash, X } from "lucide-react";

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertBookmark: (bookmarkData: { id: string; name: string; description?: string }) => void;
}

export const BookmarkDialog = ({ open, onOpenChange, onInsertBookmark }: BookmarkDialogProps) => {
  const [bookmarkName, setBookmarkName] = useState("");
  const [bookmarkId, setBookmarkId] = useState("");
  const [bookmarkDescription, setBookmarkDescription] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setBookmarkName("");
      setBookmarkId("");
      setBookmarkDescription("");
      
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handleNameChange = (name: string) => {
    setBookmarkName(name);
    if (name.trim()) {
      setBookmarkId(generateId(name));
    } else {
      setBookmarkId("");
    }
  };

  const handleInsert = () => {
    if (!bookmarkName.trim() || !bookmarkId.trim()) return;
    
    onInsertBookmark({
      id: bookmarkId.trim(),
      name: bookmarkName.trim(),
      description: bookmarkDescription.trim() || undefined
    });
    
    handleClose();
  };

  const handleClose = () => {
    setBookmarkName("");
    setBookmarkId("");
    setBookmarkDescription("");
    onOpenChange(false);
  };

  const isValidId = (id: string) => {
    return /^[a-z0-9-]+$/.test(id) && id.length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark size={20} />
            Insert Bookmark
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookmark-name">Bookmark Name</Label>
            <Input
              ref={nameInputRef}
              id="bookmark-name"
              value={bookmarkName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter bookmark name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleInsert();
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              This will create an anchor point that can be linked to
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookmark-id">Bookmark ID</Label>
            <div className="flex gap-2">
              <div className="flex items-center">
                <Hash size={16} className="text-muted-foreground" />
              </div>
              <Input
                id="bookmark-id"
                value={bookmarkId}
                onChange={(e) => setBookmarkId(e.target.value)}
                placeholder="auto-generated-id"
                className="flex-1"
              />
            </div>
            {bookmarkId && !isValidId(bookmarkId) && (
              <p className="text-sm text-destructive">
                ID can only contain lowercase letters, numbers, and hyphens
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Links to this bookmark will use: <code className="bg-muted px-1 rounded">#<span className="text-primary">{bookmarkId || 'bookmark-id'}</span></code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookmark-description">Description (optional)</Label>
            <Textarea
              id="bookmark-description"
              value={bookmarkDescription}
              onChange={(e) => setBookmarkDescription(e.target.value)}
              placeholder="Brief description of this bookmark"
              rows={3}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">How to use:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• This creates an anchor point in your document</li>
              <li>• Link to it using: <code className="bg-background px-1 rounded">#{bookmarkId || 'bookmark-id'}</code></li>
              <li>• Useful for table of contents and internal navigation</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button onClick={handleClose} variant="outline">
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleInsert} 
              disabled={!bookmarkName.trim() || !bookmarkId.trim() || !isValidId(bookmarkId)}
            >
              <Bookmark size={16} className="mr-2" />
              Insert Bookmark
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};