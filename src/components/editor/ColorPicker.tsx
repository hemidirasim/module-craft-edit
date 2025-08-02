import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  onColorSelect: (color: string, type: 'background' | 'text') => void;
  configuration?: any;
}

export const ColorPicker = ({ onColorSelect, configuration = {} }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(configuration.backgroundColor || '#ffffff');
  const [textColor, setTextColor] = useState(configuration.textColor || '#000000');

  const handleBackgroundChange = (color: string) => {
    setBackgroundColor(color);
    onColorSelect(color, 'background');
  };

  const handleTextChange = (color: string) => {
    setTextColor(color);
    onColorSelect(color, 'text');
  };

  const presetColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
    '#6c757d', '#495057', '#343a40', '#212529', '#000000',
    '#fff3cd', '#ffeeba', '#ffdf7e', '#f0d43a', '#212529',
    '#d1ecf1', '#bee5eb', '#86cfda', '#17a2b8', '#138496',
    '#d4edda', '#c3e6cb', '#95d5b0', '#28a745', '#1e7e34',
    '#f8d7da', '#f5c6cb', '#f1b0b7', '#dc3545', '#bd2130',
    '#e2e3e5', '#d6d8db', '#c5c7ca', '#6c757d', '#495057'
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent"
          title="Colors"
        >
          <Palette size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Background & Color Settings</h4>
          
          {/* Background Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background Color</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                style={{ backgroundColor }}
                onClick={() => document.getElementById('bg-color-input')?.click()}
              />
              <Input
                id="bg-color-input"
                type="color"
                value={backgroundColor}
                onChange={(e) => handleBackgroundChange(e.target.value)}
                className="w-16 h-8 p-0 border-0 cursor-pointer"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => handleBackgroundChange(e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Color</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                style={{ backgroundColor: textColor }}
                onClick={() => document.getElementById('text-color-input')?.click()}
              />
              <Input
                id="text-color-input"
                type="color"
                value={textColor}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-16 h-8 p-0 border-0 cursor-pointer"
              />
              <Input
                type="text"
                value={textColor}
                onChange={(e) => handleTextChange(e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preset Colors</Label>
            <div className="grid grid-cols-11 gap-1">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleBackgroundChange(color)}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div 
              className="w-full h-16 rounded border border-border p-2 text-sm"
              style={{ 
                backgroundColor, 
                color: textColor 
              }}
            >
              Sample text with selected colors
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};