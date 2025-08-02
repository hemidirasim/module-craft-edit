import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmojiPicker } from "./EmojiPicker";
import { TableSelector } from "./TableSelector";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Link,
  Image,
  Code2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  ChevronDown,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  Scissors,
  Search,
  Edit,
  ClipboardList,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table,
  Play,
  Smile,
  Bookmark
} from "lucide-react";

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  configuration?: any;
}

export const EditorToolbar = ({ onCommand, configuration = {} }: EditorToolbarProps) => {
  const fontFamilies = [
    "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", 
    "Courier New", "Tahoma", "Comic Sans MS", "Impact", "Trebuchet MS"
  ];

  const fontSizes = [
    "8px", "10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"
  ];

  const colors = [
    "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
    "#800000", "#008000", "#000080", "#808000", "#800080", "#008080"
  ];

  const editTools = [
    { icon: Undo2, command: "undo", tooltip: "Undo (Ctrl+Z)", enabled: true },
    { icon: Redo2, command: "redo", tooltip: "Redo (Ctrl+Y)", enabled: true },
  ];

  const clipboardTools = [
    { icon: Copy, command: "copy", tooltip: "Copy (Ctrl+C)", enabled: true },
    { icon: Clipboard, command: "paste", tooltip: "Paste (Ctrl+V)", enabled: true },
    { icon: Scissors, command: "cut", tooltip: "Cut (Ctrl+X)", enabled: true },
  ];

  const formatTools = [
    { icon: Bold, command: "bold", tooltip: "Bold", enabled: configuration.enableBold !== false },
    { icon: Italic, command: "italic", tooltip: "Italic", enabled: configuration.enableItalic !== false },
    { icon: Underline, command: "underline", tooltip: "Underline", enabled: configuration.enableUnderline !== false },
    { icon: Strikethrough, command: "strikethrough", tooltip: "Strikethrough", enabled: configuration.enableStrikethrough !== false },
  ].filter(tool => tool.enabled);

  const alignTools = [
    { icon: AlignLeft, command: "justifyLeft", tooltip: "Align Left", enabled: configuration.enableAlignment !== false },
    { icon: AlignCenter, command: "justifyCenter", tooltip: "Align Center", enabled: configuration.enableAlignment !== false },
    { icon: AlignRight, command: "justifyRight", tooltip: "Align Right", enabled: configuration.enableAlignment !== false },
  ].filter(tool => tool.enabled);

  const listTools = [
    { icon: List, command: "insertUnorderedList", tooltip: "Bulleted List", enabled: configuration.enableList !== false },
    { icon: ListOrdered, command: "insertOrderedList", tooltip: "Numbered List", enabled: configuration.enableList !== false },
    { icon: CheckSquare, command: "insertTodoList", tooltip: "To-Do List", enabled: configuration.enableList !== false },
  ].filter(tool => tool.enabled);

  const contentTools = [
    { icon: Link, command: "createLink", tooltip: "Insert Link", enabled: configuration.enableLink !== false },
    { icon: Image, command: "insertImage", tooltip: "Insert Image", enabled: configuration.enableImage !== false },
    { icon: Table, command: "insertTable", tooltip: "Insert Table", enabled: configuration.enableTable !== false },
    { icon: Quote, command: "formatBlock", tooltip: "Block Quote", enabled: configuration.enableBlockquote !== false },
    { icon: Play, command: "insertEmbed", tooltip: "Insert Media/Embed", enabled: configuration.enableEmbed !== false },
    { icon: Smile, command: "insertEmoji", tooltip: "Insert Emoji", enabled: configuration.enableEmoji !== false },
    { icon: Bookmark, command: "insertBookmark", tooltip: "Insert Bookmark", enabled: configuration.enableBookmark !== false },
    { icon: Code2, command: "toggleHtmlView", tooltip: "HTML View", enabled: configuration.enableCode !== false },
    { icon: Search, command: "findReplace", tooltip: "Find & Replace (Ctrl+F)", enabled: true },
  ].filter(tool => tool.enabled);

  return (
    <div className="border-b border-border p-2 flex gap-1 flex-wrap bg-background/50 backdrop-blur-sm">
      {/* Edit Tools Dropdown */}
      {editTools.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-accent"
                title="Edit Tools"
              >
                <Edit size={16} />
                <ChevronDown size={12} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
              {editTools.map((tool) => (
                <DropdownMenuItem
                  key={tool.command}
                  onClick={() => onCommand(tool.command)}
                  className="cursor-pointer hover:bg-accent"
                >
                  <tool.icon size={16} className="mr-2" />
                  {tool.tooltip}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* Clipboard Tools Dropdown */}
      {clipboardTools.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-accent"
                title="Clipboard Tools"
              >
                <ClipboardList size={16} />
                <ChevronDown size={12} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
              {clipboardTools.map((tool) => (
                <DropdownMenuItem
                  key={tool.command}
                  onClick={() => onCommand(tool.command)}
                  className="cursor-pointer hover:bg-accent"
                >
                  <tool.icon size={16} className="mr-2" />
                  {tool.tooltip}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* List Tools */}
      {listTools.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-accent"
                title="Lists"
              >
                <List size={16} />
                <ChevronDown size={12} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
              {listTools.map((tool) => (
                <DropdownMenuItem
                  key={tool.command}
                  onClick={() => onCommand(tool.command)}
                  className="cursor-pointer hover:bg-accent"
                >
                  <tool.icon size={16} className="mr-2" />
                  {tool.tooltip}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => onCommand("indent")}
                className="cursor-pointer hover:bg-accent"
              >
                <div className="w-4 h-4 mr-2 flex items-center justify-center text-xs">→</div>
                Indent (Multi-level)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCommand("outdent")}
                className="cursor-pointer hover:bg-accent"
              >
                <div className="w-4 h-4 mr-2 flex items-center justify-center text-xs">←</div>
                Outdent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* Format Tools */}
      {formatTools.length > 0 && (
        <>
          {formatTools.map((tool) => (
            <Button
              key={tool.command}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent"
              onClick={() => onCommand(tool.command)}
              title={tool.tooltip}
            >
              <tool.icon size={16} />
            </Button>
          ))}
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* Font Family */}
      {configuration.enableFont !== false && (
        <>
          <Select onValueChange={(value) => onCommand("fontName", value)}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* Font Size */}
      {configuration.enableFont !== false && (
        <>
          <Select onValueChange={(value) => onCommand("fontSize", value)}>
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* Color Picker */}
      {configuration.enableColor !== false && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                title="Text Color"
              >
                <Palette size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-6 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => onCommand("foreColor", color)}
                    title={color}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* Alignment Tools */}
      {alignTools.length > 0 && (
        <>
          {alignTools.map((tool) => (
            <Button
              key={tool.command}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent"
              onClick={() => onCommand(tool.command)}
              title={tool.tooltip}
            >
              <tool.icon size={16} />
            </Button>
          ))}
          <div className="w-px h-6 bg-border mx-1 self-center" />
        </>
      )}

      {/* Content Tools */}
      <div className="flex gap-1">
        {contentTools.filter(tool => !['insertTable', 'insertEmoji'].includes(tool.command)).map((tool) => (
          <Button
            key={tool.command}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            onClick={() => {
              if (tool.command === "createLink") {
                const url = prompt("Enter URL:");
                if (url) onCommand(tool.command, url);
              } else if (tool.command === "insertImage") {
                const url = prompt("Enter image URL:");
                if (url) onCommand(tool.command, url);
              } else if (tool.command === "formatBlock") {
                onCommand(tool.command, "blockquote");
              } else if (tool.command === "insertEmbed") {
                const embedCode = prompt("Enter embed code or URL:");
                if (embedCode) onCommand(tool.command, embedCode);
              } else if (tool.command === "insertBookmark") {
                const name = prompt("Bookmark name:");
                if (name) onCommand(tool.command, name);
              } else {
                onCommand(tool.command);
              }
            }}
            title={tool.tooltip}
          >
            <tool.icon size={16} />
          </Button>
        ))}
        
        <TableSelector onTableSelect={(rows, cols) => onCommand('insertTable', `${rows}x${cols}`)} />
        <EmojiPicker onEmojiSelect={(emoji) => onCommand('insertEmoji', emoji)} />
      </div>
    </div>
  );
};