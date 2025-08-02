import { useRef, useState, useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { Card } from "@/components/ui/card";

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

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleCommand = (command: string, value?: string) => {
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
      }
    }
  };

  return (
    <Card className="overflow-hidden shadow-card">
      <EditorToolbar onCommand={handleCommand} configuration={configuration} />
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
          fontFamily: configuration.enableCustomFont ? configuration.fontFamily : undefined,
          fontSize: configuration.enableCustomFont ? configuration.fontSize : undefined,
          backgroundColor: configuration.enableCustomBackground ? configuration.backgroundColor : undefined,
          color: configuration.enableCustomBackground ? configuration.textColor : undefined,
          background: editorRef.current?.innerHTML === '' ? 
            `url("data:text/plain;charset=UTF-8,${encodeURIComponent(placeholder)}") no-repeat 1rem 1rem` : 
            (configuration.enableCustomBackground ? configuration.backgroundColor : 'transparent')
        }}
        onInput={handleContentChange}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </Card>
  );
};