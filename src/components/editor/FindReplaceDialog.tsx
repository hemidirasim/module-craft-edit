import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Replace, X } from "lucide-react";

interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

export const FindReplaceDialog = ({ open, onOpenChange, editorRef }: FindReplaceDialogProps) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && findInputRef.current) {
      findInputRef.current.focus();
    }
  }, [open]);

  const findMatches = (text: string) => {
    if (!text || !editorRef.current) return 0;
    
    const editor = editorRef.current;
    const content = editor.textContent || "";
    const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  };

  const highlightText = (searchText: string) => {
    if (!searchText || !editorRef.current) return;
    
    const editor = editorRef.current;
    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    // Remove existing highlights
    const highlights = editor.querySelectorAll('.find-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize();
      }
    });

    // Add new highlights
    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      if (regex.test(text)) {
        const parent = textNode.parentNode;
        if (parent) {
          const wrapper = document.createElement('span');
          wrapper.innerHTML = text.replace(regex, '<span class="find-highlight bg-yellow-200 dark:bg-yellow-800">$1</span>');
          parent.replaceChild(wrapper, textNode);
        }
      }
    });
  };

  const handleFind = () => {
    if (!findText) return;
    
    const matches = findMatches(findText);
    setTotalMatches(matches);
    setCurrentMatch(matches > 0 ? 1 : 0);
    highlightText(findText);
  };

  const handleReplace = () => {
    if (!findText || !editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = window.getSelection();
    
    if (selection && selection.toString().toLowerCase() === findText.toLowerCase()) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(replaceText));
      selection.removeAllRanges();
    }
    
    handleFind(); // Update highlights after replace
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    
    const editor = editorRef.current;
    const content = editor.innerHTML;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newContent = content.replace(regex, replaceText);
    editor.innerHTML = newContent;
    
    setTotalMatches(0);
    setCurrentMatch(0);
  };

  const clearHighlights = () => {
    if (!editorRef.current) return;
    
    const highlights = editorRef.current.querySelectorAll('.find-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize();
      }
    });
  };

  const handleClose = () => {
    clearHighlights();
    setFindText("");
    setReplaceText("");
    setCurrentMatch(0);
    setTotalMatches(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search size={20} />
            Find & Replace
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="find">Find</Label>
            <div className="flex gap-2">
              <Input
                ref={findInputRef}
                id="find"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Enter text to find"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFind();
                  }
                }}
              />
              <Button onClick={handleFind} size="sm">
                <Search size={16} />
              </Button>
            </div>
            {totalMatches > 0 && (
              <p className="text-sm text-muted-foreground">
                {currentMatch} of {totalMatches} matches
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="replace">Replace with</Label>
            <div className="flex gap-2">
              <Input
                id="replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Enter replacement text"
              />
              <Button onClick={handleReplace} size="sm" disabled={!findText}>
                <Replace size={16} />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleReplaceAll} variant="outline" disabled={!findText}>
              Replace All
            </Button>
            <Button onClick={handleClose} variant="outline">
              <X size={16} className="mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};