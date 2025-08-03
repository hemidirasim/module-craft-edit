import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmojiPicker } from "./EmojiPicker";
import { TableSelector } from "./TableSelector";
import { LinkDialog } from "./LinkDialog";
import { ImageDialog } from "./ImageDialog";
import { MediaDialog } from "./MediaDialog";
import { BookmarkDialog } from "./BookmarkDialog";
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
  selectedText?: string;
}

export const EditorToolbar = ({ onCommand, configuration = {}, selectedText = "" }: EditorToolbarProps) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const blockTypes = [
    { label: "Paragraph", value: "p", tag: "div" },
    { label: "Heading 1", value: "h1", tag: "h1" },
    { label: "Heading 2", value: "h2", tag: "h2" },
    { label: "Heading 3", value: "h3", tag: "h3" },
    { label: "Heading 4", value: "h4", tag: "h4" },
    { label: "Heading 5", value: "h5", tag: "h5" },
    { label: "Heading 6", value: "h6", tag: "h6" },
    { label: "Preformatted", value: "pre", tag: "pre" },
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
      {/* Edit Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 hover:bg-accent"
            title="Edit"
          >
            Edit
            <ChevronDown size={12} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
          <DropdownMenuItem onClick={() => onCommand('undo')} className="cursor-pointer hover:bg-accent">
            <Undo2 size={16} className="mr-2" />
            Undo (Ctrl+Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('redo')} className="cursor-pointer hover:bg-accent">
            <Redo2 size={16} className="mr-2" />
            Redo (Ctrl+Y)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('cut')} className="cursor-pointer hover:bg-accent">
            <Scissors size={16} className="mr-2" />
            Cut (Ctrl+X)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('copy')} className="cursor-pointer hover:bg-accent">
            <Copy size={16} className="mr-2" />
            Copy (Ctrl+C)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('paste')} className="cursor-pointer hover:bg-accent">
            <Clipboard size={16} className="mr-2" />
            Paste (Ctrl+V)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('findReplace')} className="cursor-pointer hover:bg-accent">
            <Search size={16} className="mr-2" />
            Find & Replace (Ctrl+F)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Format Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 hover:bg-accent"
            title="Format"
          >
            Format
            <ChevronDown size={12} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
          {/* Font Family */}
          <div className="px-2 py-1">
            <label className="text-xs text-muted-foreground">Font Family</label>
            <Select onValueChange={(value) => onCommand("fontName", value)}>
              <SelectTrigger className="h-8 w-full mt-1">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Font Size */}
          <div className="px-2 py-1">
            <label className="text-xs text-muted-foreground">Font Size</label>
            <Select onValueChange={(value) => onCommand("fontSize", value)}>
              <SelectTrigger className="h-8 w-full mt-1">
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
          </div>
          {/* Text Color */}
          <div className="px-2 py-1">
            <label className="text-xs text-muted-foreground">Text Color</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-full mt-1 justify-start">
                  <Palette size={16} className="mr-2" />
                  Choose color
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
          </div>
          {/* Background Color */}
          <div className="px-2 py-1">
            <label className="text-xs text-muted-foreground">Background Color</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-full mt-1 justify-start">
                  <div className="w-4 h-4 mr-2 bg-gradient-to-r from-red-500 to-blue-500 rounded border"></div>
                  Choose background
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
                      onClick={() => onCommand("backColor", color)}
                      title={color}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Insert Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 hover:bg-accent"
            title="Insert"
          >
            Insert
            <ChevronDown size={12} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
          <DropdownMenuItem 
            onClick={() => setShowLinkDialog(true)}
            className="cursor-pointer hover:bg-accent"
          >
            <Link size={16} className="mr-2" />
            Link
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowImageDialog(true)}
            className="cursor-pointer hover:bg-accent"
          >
            <Image size={16} className="mr-2" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowMediaDialog(true)}
            className="cursor-pointer hover:bg-accent"
          >
            <Play size={16} className="mr-2" />
            Media/Embed
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowBookmarkDialog(true)}
            className="cursor-pointer hover:bg-accent"
          >
            <Bookmark size={16} className="mr-2" />
            Bookmark
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Block Format */}
      <Select onValueChange={(value) => onCommand("formatBlock", value)}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue placeholder="Paragraph" />
        </SelectTrigger>
        <SelectContent>
          {blockTypes.map((block) => (
            <SelectItem key={block.value} value={block.value}>
              {block.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Essential formatting tools directly accessible */}
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

      {/* Lists */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            title="Lists"
          >
            <List size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
          <DropdownMenuItem onClick={() => onCommand('insertUnorderedList')} className="cursor-pointer hover:bg-accent">
            <List size={16} className="mr-2" />
            Bulleted List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('insertOrderedList')} className="cursor-pointer hover:bg-accent">
            <ListOrdered size={16} className="mr-2" />
            Numbered List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('insertTodoList')} className="cursor-pointer hover:bg-accent">
            <CheckSquare size={16} className="mr-2" />
            To-Do List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('indent')} className="cursor-pointer hover:bg-accent">
            <div className="w-4 h-4 mr-2 flex items-center justify-center text-xs">→</div>
            Indent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCommand('outdent')} className="cursor-pointer hover:bg-accent">
            <div className="w-4 h-4 mr-2 flex items-center justify-center text-xs">←</div>
            Outdent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alignment tools */}
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

      {/* Quote and HTML view */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent"
        onClick={() => onCommand('formatBlock', 'blockquote')}
        title="Block Quote"
      >
        <Quote size={16} />
      </Button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      {/* Table Selector */}
      <Popover open={showTableSelector} onOpenChange={setShowTableSelector}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            title="Insert Table"
          >
            <Table size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 bg-background border border-border shadow-lg z-50">
          <TableSelector onTableSelect={(rows, cols) => {
            onCommand('insertTable', `${rows}x${cols}`);
            setShowTableSelector(false);
          }} />
        </PopoverContent>
      </Popover>

      {/* Emoji Picker */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            title="Insert Emoji"
          >
            <Smile size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-background border border-border shadow-lg z-50">
          <EmojiPicker onEmojiSelect={(emoji) => {
            onCommand('insertEmoji', emoji);
            setShowEmojiPicker(false);
          }} />
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent"
        onClick={() => onCommand('toggleHtmlView')}
        title="HTML View"
      >
        <Code2 size={16} />
      </Button>


      {/* Dialog Components */}
      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onInsertLink={(linkData) => {
          console.log('🔗 LinkDialog callback called with:', linkData);
          const linkHtml = `<a href="${linkData.url}"${linkData.target ? ` target="${linkData.target}"` : ''}${linkData.title ? ` title="${linkData.title}"` : ''}>${linkData.text}</a>`;
          console.log('🔗 Generated HTML:', linkHtml);
          onCommand('insertHTML', linkHtml);
        }}
        selectedText={selectedText}
      />
      
      <ImageDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onInsertImage={(imageData) => {
          const imageHtml = `<img src="${imageData.src}" alt="${imageData.alt}"${imageData.width ? ` width="${imageData.width}"` : ''}${imageData.height ? ` height="${imageData.height}"` : ''} />`;
          onCommand('insertHTML', imageHtml);
        }}
      />
      
      <MediaDialog
        open={showMediaDialog}
        onOpenChange={setShowMediaDialog}
        onInsertMedia={(mediaData) => {
          onCommand('insertHTML', mediaData.content);
        }}
      />
      
      <BookmarkDialog
        open={showBookmarkDialog}
        onOpenChange={setShowBookmarkDialog}
        onInsertBookmark={(bookmarkData) => {
          const bookmarkHtml = `<a id="${bookmarkData.id}" name="${bookmarkData.id}" title="${bookmarkData.description || ''}">📖 ${bookmarkData.name}</a>`;
          onCommand('insertHTML', bookmarkHtml);
        }}
      />
    </div>
  );
};