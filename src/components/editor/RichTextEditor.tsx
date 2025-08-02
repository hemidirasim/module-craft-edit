import { useRef, useState, useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { FindReplaceDialog } from "./FindReplaceDialog";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  configuration?: any;
}

export const RichTextEditor = ({ 
  content = "", 
  onChange, 
  placeholder = "Start writing...",
  configuration = {}
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isHtmlView, setIsHtmlView] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML && !isHtmlView) {
      editorRef.current.innerHTML = content;
    }
  }, [content, isHtmlView]);

  // Don't reset htmlContent automatically - only sync when switching views

  const handleCommand = (command: string, value?: string) => {
    // Handle special commands
    if (command === "toggleHtmlView") {
      if (!isHtmlView && editorRef.current) {
        // Visual -> HTML: capture current content
        const currentContent = editorRef.current.innerHTML;
        setHtmlContent(currentContent);
        console.log('Dashboard: Setting HTML content to:', currentContent);
      } else if (isHtmlView && editorRef.current) {
        // HTML -> Visual: apply HTML content to visual editor
        editorRef.current.innerHTML = htmlContent;
        console.log('Dashboard: Setting Visual content to:', htmlContent);
      }
      setIsHtmlView(!isHtmlView);
      return;
    }

    if (command === "findReplace") {
      setShowFindReplace(true);
      return;
    }

    // Handle clipboard operations
    if (command === "copy") {
      document.execCommand("copy");
      return;
    }
    
    if (command === "paste") {
      document.execCommand("paste");
      return;
    }
    
    if (command === "cut") {
      document.execCommand("cut");
      return;
    }

    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      if (command === "createLink") {
        const url = prompt("Enter URL:");
        if (url) {
          document.execCommand(command, false, url);
        }
      } else if (command === "insertImage") {
        const url = prompt("Enter image URL:");
        if (url) {
          document.execCommand("insertImage", false, url);
        }
      } else if (command === "backgroundColor") {
        const color = prompt("Enter background color (hex):");
        if (color) {
          document.execCommand("hiliteColor", false, color);
        }
      } else {
        document.execCommand(command, false, value);
      }
      
      handleContentChange();
    } catch (error) {
      console.error("Command execution failed:", error);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleHtmlChange = (value: string) => {
    setHtmlContent(value);
    if (editorRef.current && onChange) {
      editorRef.current.innerHTML = value;
      onChange(value);
    }
  };

  console.log('Current state - isHtmlView:', isHtmlView, 'htmlContent:', htmlContent);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          handleCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          handleCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleCommand('redo');
          } else {
            handleCommand('undo');
          }
          break;
        case 'y':
          e.preventDefault();
          handleCommand('redo');
          break;
        case 'f':
          e.preventDefault();
          setShowFindReplace(true);
          break;
        case 'a':
          e.preventDefault();
          document.execCommand('selectAll');
          break;
      }
    }
  };

  return (
    <>
      <Card className="overflow-hidden shadow-card">
        <EditorToolbar onCommand={handleCommand} configuration={configuration} />
        {isHtmlView ? (
          <Textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm resize-none border-0 rounded-none"
            placeholder="<p>Enter HTML here...</p>"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            className={`
              min-h-[300px] p-4 outline-none text-foreground bg-background
              prose prose-sm max-w-none
              focus:ring-2 focus:ring-primary/20 focus:ring-inset
              ${isEditorFocused ? 'ring-2 ring-primary/20' : ''}
            `}
            style={{
              fontFamily: configuration.fontFamily || undefined,
              fontSize: configuration.fontSize || undefined,
              backgroundColor: configuration.backgroundColor || undefined,
              color: configuration.textColor || undefined,
              background: editorRef.current?.innerHTML === '' ? 
                `url("data:text/plain;charset=UTF-8,${encodeURIComponent(placeholder)}") no-repeat 1rem 1rem` : 
                'transparent'
            }}
            onInput={handleContentChange}
            onFocus={() => setIsEditorFocused(true)}
            onBlur={() => setIsEditorFocused(false)}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </Card>
      
      <FindReplaceDialog 
        open={showFindReplace} 
        onOpenChange={setShowFindReplace}
        editorRef={editorRef}
      />
    </>
  );
};