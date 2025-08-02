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
  AlignRight
} from "lucide-react";

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
}

export const EditorToolbar = ({ onCommand }: EditorToolbarProps) => {
  const toolGroups = [
    {
      name: "formatting",
      tools: [
        { icon: Bold, command: "bold", tooltip: "Bold" },
        { icon: Italic, command: "italic", tooltip: "Italic" },
        { icon: Underline, command: "underline", tooltip: "Underline" },
        { icon: Strikethrough, command: "strikethrough", tooltip: "Strikethrough" },
      ]
    },
    {
      name: "alignment",
      tools: [
        { icon: AlignLeft, command: "justifyLeft", tooltip: "Align Left" },
        { icon: AlignCenter, command: "justifyCenter", tooltip: "Align Center" },
        { icon: AlignRight, command: "justifyRight", tooltip: "Align Right" },
      ]
    },
    {
      name: "content",
      tools: [
        { icon: Link, command: "createLink", tooltip: "Insert Link" },
        { icon: Image, command: "insertImage", tooltip: "Insert Image" },
        { icon: Code, command: "formatBlock", value: "pre", tooltip: "Code Block" },
        { icon: Type, command: "fontSize", tooltip: "Font Size" },
      ]
    }
  ];

  return (
    <div className="border-b border-border p-2 flex gap-1 flex-wrap bg-background/50 backdrop-blur-sm">
      {toolGroups.map((group, groupIndex) => (
        <div key={group.name} className="flex gap-1">
          {group.tools.map((tool) => (
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
          {groupIndex < toolGroups.length - 1 && (
            <div className="w-px h-6 bg-border mx-1 self-center" />
          )}
        </div>
      ))}
    </div>
  );
};