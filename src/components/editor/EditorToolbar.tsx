import { Button } from "@/components/ui/button";
import { ColorPicker } from "./ColorPicker";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Link,
  Image,
  Code,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onColorChange?: (color: string, type: 'background' | 'text' | 'font' | 'size') => void;
  configuration?: any;
}

export const EditorToolbar = ({ onCommand, onColorChange, configuration = {} }: EditorToolbarProps) => {
  const toolGroups = [
    {
      name: "formatting",
      tools: [
        { icon: Bold, command: "bold", tooltip: "Bold", enabled: configuration.enableBold !== false },
        { icon: Italic, command: "italic", tooltip: "Italic", enabled: configuration.enableItalic !== false },
        { icon: Underline, command: "underline", tooltip: "Underline", enabled: configuration.enableUnderline !== false },
        { icon: Strikethrough, command: "strikethrough", tooltip: "Strikethrough", enabled: configuration.enableStrikethrough !== false },
      ]
    },
    {
      name: "alignment",
      tools: [
        { icon: AlignLeft, command: "justifyLeft", tooltip: "Align Left", enabled: configuration.enableAlignment !== false },
        { icon: AlignCenter, command: "justifyCenter", tooltip: "Align Center", enabled: configuration.enableAlignment !== false },
        { icon: AlignRight, command: "justifyRight", tooltip: "Align Right", enabled: configuration.enableAlignment !== false },
      ]
    },
    {
      name: "content",
      tools: [
        { icon: Link, command: "createLink", tooltip: "Insert Link", enabled: configuration.enableLink !== false },
        { icon: Image, command: "insertImage", tooltip: "Insert Image", enabled: configuration.enableImage !== false },
        { icon: Code, command: "formatBlock", value: "pre", tooltip: "Code Block", enabled: configuration.enableCode !== false },
        { icon: Type, command: "fontSize", tooltip: "Font Size", enabled: true },
      ]
    }
  ];

  return (
    <div className="border-b border-border p-2 flex gap-1 flex-wrap bg-background/50 backdrop-blur-sm">
      {toolGroups.map((group, groupIndex) => {
        const enabledTools = group.tools.filter(tool => tool.enabled);
        if (enabledTools.length === 0) return null;
        
        return (
          <div key={group.name} className="flex gap-1">
            {enabledTools.map((tool) => (
              <Button
                key={tool.command}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => onCommand(tool.command, tool.value)}
                title={tool.tooltip}
              >
                <tool.icon size={16} />
              </Button>
            ))}
            {groupIndex < toolGroups.length - 1 && enabledTools.length > 0 && (
              <div className="w-px h-6 bg-border mx-1 self-center" />
            )}
          </div>
        );
      })}
      
      {/* Color & Font Controls */}
      {(configuration.enableCustomBackground !== false || configuration.enableCustomFont !== false) && onColorChange && (
        <>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          {configuration.enableCustomBackground !== false && (
            <ColorPicker onColorSelect={onColorChange} configuration={configuration} />
          )}
          {configuration.enableCustomFont !== false && (
            <div className="flex gap-1">
              <select 
                className="h-8 px-2 text-xs bg-background border border-border rounded"
                onChange={(e) => onColorChange?.(e.target.value, 'font')}
                value={configuration.fontFamily || 'Arial'}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier</option>
                <option value="Verdana">Verdana</option>
              </select>
              <select 
                className="h-8 px-2 text-xs bg-background border border-border rounded"
                onChange={(e) => onColorChange?.(e.target.value, 'size')}
                value={configuration.fontSize || '14px'}
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
};