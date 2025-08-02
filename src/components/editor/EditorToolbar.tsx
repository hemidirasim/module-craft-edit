import { Button } from "@/components/ui/button";
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
  AlignRight,
  Palette
} from "lucide-react";

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  configuration?: any;
}

export const EditorToolbar = ({ onCommand, configuration = {} }: EditorToolbarProps) => {
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
        { icon: Type, command: "fontSize", tooltip: "Font", enabled: configuration.enableFont !== false },
        { icon: Palette, command: "foreColor", tooltip: "Color", enabled: configuration.enableColor !== false },
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
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => {
                  if (tool.command === "foreColor") {
                    const color = prompt("Enter color (hex):");
                    if (color) onCommand(tool.command, color);
                  } else if (tool.command === "fontSize") {
                    const size = prompt("Enter font size (e.g., 16px):");
                    if (size) onCommand(tool.command, size);
                  } else {
                    onCommand(tool.command, tool.value);
                  }
                }}
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
    </div>
  );
};