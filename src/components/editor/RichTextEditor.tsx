import { useRef, useState, useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { FindReplaceDialog } from "./FindReplaceDialog";
import { TableContextMenu } from "./TableContextMenu";
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; element: HTMLElement } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeData, setResizeData] = useState<{ startX: number; startWidth: number; column: HTMLElement } | null>(null);

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
      // Handle special commands first
      if (command === 'insertTodoList') {
        document.execCommand('insertHTML', false, '<ul style="list-style-type: none;"><li><input type="checkbox" style="margin-right: 8px;"> Todo item</li></ul>');
        handleContentChange();
        return;
      }

      if (command === 'insertTable') {
        if (value) {
          const [rows, cols] = value.split('x').map(Number);
          let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 16px 0; table-layout: fixed;">';
          
          // Create simple data rows (no header)
          for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
              const width = `${100 / cols}%`;
              tableHTML += `<td style="padding: 12px; border: 1px solid #ccc; min-height: 40px; width: ${width};" contenteditable="true"></td>`;
            }
            tableHTML += '</tr>';
          }
          tableHTML += '</table><br>';
          document.execCommand('insertHTML', false, tableHTML);
          handleContentChange();
          return;
        }
      }

      if (command === 'formatBlock' && value === 'blockquote') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString() || 'Quote text';
          const blockquoteHTML = `<blockquote style="border-left: 4px solid #007cba; padding-left: 16px; margin: 16px 0; font-style: italic; color: #666;">${selectedText}</blockquote>`;
          document.execCommand('insertHTML', false, blockquoteHTML);
        }
        handleContentChange();
        return;
      }

      if (command === 'insertOrderedList') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString() || 'List item';
          const listHTML = `<ol style="margin: 16px 0; padding-left: 20px;"><li>${selectedText}</li></ol>`;
          document.execCommand('insertHTML', false, listHTML);
        } else {
          const listHTML = `<ol style="margin: 16px 0; padding-left: 20px;"><li>List item</li></ol>`;
          document.execCommand('insertHTML', false, listHTML);
        }
        handleContentChange();
        return;
      }

      if (command === 'insertUnorderedList') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString() || 'List item';
          const listHTML = `<ul style="margin: 16px 0; padding-left: 20px;"><li>${selectedText}</li></ul>`;
          document.execCommand('insertHTML', false, listHTML);
        } else {
          const listHTML = `<ul style="margin: 16px 0; padding-left: 20px;"><li>List item</li></ul>`;
          document.execCommand('insertHTML', false, listHTML);
        }
        handleContentChange();
        return;
      }

      if (command === 'insertEmbed') {
        if (value) {
          let embedHTML = '';
          if (value.includes('youtube.com') || value.includes('youtu.be')) {
            const videoId = value.includes('youtu.be') 
              ? value.split('/').pop()?.split('?')[0]
              : value.split('v=')[1]?.split('&')[0];
            embedHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
          } else if (value.includes('<iframe') || value.includes('<embed')) {
            embedHTML = value;
          } else {
            embedHTML = `<div style="background: #f5f5f5; padding: 16px; border-radius: 4px; border-left: 4px solid #007cba;"><strong>Embedded Content:</strong><br>${value}</div>`;
          }
          document.execCommand('insertHTML', false, embedHTML + '<br>');
          handleContentChange();
          return;
        }
      }

      if (command === 'insertEmoji') {
        if (value) {
          document.execCommand('insertText', false, value);
          handleContentChange();
          return;
        }
      }

      if (command === 'insertBookmark') {
        if (value) {
          const bookmarkId = value.toLowerCase().replace(/\s+/g, '-');
          const bookmarkHTML = `<a name="${bookmarkId}" id="${bookmarkId}" style="color: #007cba; font-weight: bold; text-decoration: none;">🔖 ${value}</a>`;
          document.execCommand('insertHTML', false, bookmarkHTML);
          handleContentChange();
          return;
        }
      }

      // Handle standard commands  
      if (command === "createLink") {
        const selection = window.getSelection();
        const selectedText = selection && selection.rangeCount > 0 ? selection.toString() : '';
        
        const linkText = prompt("Enter link text:", selectedText || "Link text");
        if (!linkText) return;
        
        const url = prompt("Enter URL:");
        if (url) {
          const linkHTML = `<a href="${url}" style="color: #007cba; text-decoration: underline;" target="_blank">${linkText}</a>`;
          document.execCommand('insertHTML', false, linkHTML);
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

  const handleTableAction = (action: string, element: HTMLElement) => {
    const cell = element.closest('td, th') as HTMLTableCellElement;
    const row = cell?.closest('tr') as HTMLTableRowElement;
    const table = row?.closest('table') as HTMLTableElement;
    
    if (!cell || !row || !table) return;

    switch (action) {
      case 'insertRowAbove':
        const newRowAbove = row.cloneNode(true) as HTMLTableRowElement;
        newRowAbove.querySelectorAll('td, th').forEach(cell => {
          (cell as HTMLElement).innerHTML = '';
        });
        row.parentNode?.insertBefore(newRowAbove, row);
        break;
        
      case 'insertRowBelow':
        const newRowBelow = row.cloneNode(true) as HTMLTableRowElement;
        newRowBelow.querySelectorAll('td, th').forEach(cell => {
          (cell as HTMLElement).innerHTML = '';
        });
        row.parentNode?.insertBefore(newRowBelow, row.nextSibling);
        break;
        
      case 'deleteRow':
        if (table.rows.length > 1) {
          row.remove();
        }
        break;
        
      case 'selectRow':
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.selectNodeContents(row);
          selection.addRange(range);
        }
        break;

      case 'headerRow':
        const targetRow = row;
        Array.from(targetRow.cells).forEach(cell => {
          if (cell.tagName.toLowerCase() === 'td') {
            const th = document.createElement('th');
            th.innerHTML = cell.innerHTML;
            th.style.cssText = cell.style.cssText;
            th.style.backgroundColor = '#f5f5f5';
            th.style.fontWeight = 'bold';
            th.contentEditable = 'true';
            cell.parentNode?.replaceChild(th, cell);
          }
        });
        break;

      case 'headerColumn':
        const columnIndex = cell.cellIndex;
        Array.from(table.rows).forEach(row => {
          const targetCell = row.cells[columnIndex];
          if (targetCell) {
            if (targetCell.tagName.toLowerCase() === 'td') {
              const th = document.createElement('th');
              th.innerHTML = targetCell.innerHTML;
              th.style.cssText = targetCell.style.cssText;
              th.style.backgroundColor = '#f5f5f5';
              th.style.fontWeight = 'bold';
              th.contentEditable = 'true';
              targetCell.parentNode?.replaceChild(th, targetCell);
            }
          }
        });
        break;

      case 'insertColumnLeft':
        Array.from(table.rows).forEach(row => {
          const newCell = document.createElement(row.cells[0].tagName.toLowerCase() as 'td' | 'th');
          newCell.style.cssText = cell.style.cssText;
          newCell.contentEditable = 'true';
          row.insertBefore(newCell, row.cells[cell.cellIndex]);
        });
        break;

      case 'insertColumnRight':
        Array.from(table.rows).forEach(row => {
          const newCell = document.createElement(row.cells[0].tagName.toLowerCase() as 'td' | 'th');
          newCell.style.cssText = cell.style.cssText;
          newCell.contentEditable = 'true';
          const nextCell = row.cells[cell.cellIndex + 1];
          if (nextCell) {
            row.insertBefore(newCell, nextCell);
          } else {
            row.appendChild(newCell);
          }
        });
        break;

      case 'deleteColumn':
        if (table.rows[0].cells.length > 1) {
          Array.from(table.rows).forEach(row => {
            if (row.cells[cell.cellIndex]) {
              row.deleteCell(cell.cellIndex);
            }
          });
        }
        break;

      case 'selectColumn':
        const selection2 = window.getSelection();
        if (selection2) {
          selection2.removeAllRanges();
          Array.from(table.rows).forEach(row => {
            const targetCell = row.cells[cell.cellIndex];
            if (targetCell) {
              const range = document.createRange();
              range.selectNodeContents(targetCell);
              selection2.addRange(range);
            }
          });
        }
        break;
    }
    
    handleContentChange();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td, th');
    
    if (cell) {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        element: cell as HTMLElement
      });
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

  // Column resizing functionality
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing && resizeData) {
      const diff = e.clientX - resizeData.startX;
      const newWidth = Math.max(50, resizeData.startWidth + diff); // Minimum 50px
      resizeData.column.style.width = `${newWidth}px`;
      resizeData.column.style.minWidth = `${newWidth}px`;
      resizeData.column.style.maxWidth = `${newWidth}px`;
    } else {
      // Check if hovering near column border
      const target = e.target as HTMLElement;
      const cell = target.closest('td, th') as HTMLTableCellElement;
      if (cell) {
        const rect = cell.getBoundingClientRect();
        const isNearRightBorder = e.clientX > rect.right - 8;
        const isNearLeftBorder = e.clientX < rect.left + 8;
        
        if (isNearRightBorder || isNearLeftBorder) {
          (e.target as HTMLElement).style.cursor = 'col-resize';
        } else {
          (e.target as HTMLElement).style.cursor = 'text';
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement;
    if (cell) {
      const rect = cell.getBoundingClientRect();
      const isNearRightBorder = e.clientX > rect.right - 8;
      const isNearLeftBorder = e.clientX < rect.left + 8;
      
      if (isNearRightBorder) {
        e.preventDefault();
        setIsResizing(true);
        setResizeData({
          startX: e.clientX,
          startWidth: cell.offsetWidth,
          column: cell
        });
      } else if (isNearLeftBorder && cell.cellIndex > 0) {
        // When near left border, resize the previous column
        const row = cell.closest('tr') as HTMLTableRowElement;
        const prevCell = row.cells[cell.cellIndex - 1];
        if (prevCell) {
          e.preventDefault();
          setIsResizing(true);
          setResizeData({
            startX: e.clientX,
            startWidth: prevCell.offsetWidth,
            column: prevCell
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      setResizeData(null);
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isResizing]);

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
            onContextMenu={handleContextMenu}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </Card>
      
      <TableContextMenu
        position={contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null}
        onClose={() => setContextMenu(null)}
        onAction={handleTableAction}
        targetElement={contextMenu?.element || null}
      />
      
      <FindReplaceDialog 
        open={showFindReplace} 
        onOpenChange={setShowFindReplace}
        editorRef={editorRef}
      />
    </>
  );
};