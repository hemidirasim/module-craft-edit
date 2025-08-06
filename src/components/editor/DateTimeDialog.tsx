import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DateTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertDateTime: (dateTime: string) => void;
}

export const DateTimeDialog = ({ open, onOpenChange, onInsertDateTime }: DateTimeDialogProps) => {
  const [format, setFormat] = useState("full");

  const now = new Date();
  
  const formats = [
    { value: "full", label: "Full Date & Time", example: now.toLocaleString() },
    { value: "date", label: "Date Only", example: now.toLocaleDateString() },
    { value: "time", label: "Time Only", example: now.toLocaleTimeString() },
    { value: "iso", label: "ISO Format", example: now.toISOString() },
    { value: "short", label: "Short Format", example: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { value: "long", label: "Long Format", example: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
  ];

  const getCurrentDateTime = (formatType: string) => {
    const current = new Date();
    
    switch (formatType) {
      case "full":
        return current.toLocaleString();
      case "date":
        return current.toLocaleDateString();
      case "time":
        return current.toLocaleTimeString();
      case "iso":
        return current.toISOString();
      case "short":
        return current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      case "long":
        return current.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      default:
        return current.toLocaleString();
    }
  };

  const handleInsert = () => {
    const dateTime = getCurrentDateTime(format);
    onInsertDateTime(dateTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Date/Time</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="format">Date/Time Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((fmt) => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    <div className="flex flex-col">
                      <span>{fmt.label}</span>
                      <span className="text-sm text-muted-foreground">{fmt.example}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-3 bg-muted rounded-md">
            <Label className="text-sm font-medium">Preview:</Label>
            <div className="mt-1 text-sm">{getCurrentDateTime(format)}</div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleInsert}>
            Insert Date/Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};