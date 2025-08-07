import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CodeSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertCode: (code: string) => void;
}

export const CodeSampleDialog = ({ open, onOpenChange, onInsertCode }: CodeSampleDialogProps) => {
  const [code, setCode] = useState("");

  const handleInsert = () => {
    if (!code.trim()) return;
    onInsertCode(code);
    handleClose();
  };

  const handleClose = () => {
    setCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Code Sample</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
              className="mt-1 font-mono text-sm min-h-[200px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleInsert}
            disabled={!code.trim()}
          >
            Insert Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};