import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileManager } from "@/components/FileManager";
import { Files } from "lucide-react";

interface FileManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (file: any) => void;
}

export const FileManagerDialog = ({ 
  open, 
  onOpenChange, 
  onSelectFile 
}: FileManagerDialogProps) => {
  const handleFileSelect = (file: any) => {
    onSelectFile(file);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Files size={20} />
            File Manager
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[75vh]">
          <FileManager 
            onSelectFile={handleFileSelect}
            selectMode={true}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};