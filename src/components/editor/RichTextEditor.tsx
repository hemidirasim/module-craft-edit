import { useRef, useState, useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { FindReplaceDialog } from "./FindReplaceDialog";
import { TableContextMenu } from "./TableContextMenu";
import { TextContextMenu } from "./TextContextMenu";
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
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    justifyLeft: boolean;
    justifyCenter: boolean;
    justifyRight: boolean;
    fontSize: string;
    fontFamily: string;
    blockFormat: string;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    fontSize: '18px',
    fontFamily: 'Arial',
    blockFormat: 'p'
  });

  const updateActiveFormats = () => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // Check formatting commands
      const formats = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        fontSize: '18px',
        fontFamily: 'Arial',
        blockFormat: 'p'
      };

      // Get font size and family from computed style
      const range = selection.getRangeAt(0);
      let element = range.commonAncestorContainer;
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }

      if (element && element.nodeType === Node.ELEMENT_NODE) {
        const computedStyle = window.getComputedStyle(element as Element);
        
        // Get font size
        const fontSize = computedStyle.fontSize;
        if (fontSize) {
          formats.fontSize = fontSize;
        }
        
        // Get font family - clean up the value and get the first font
        let fontFamily = computedStyle.fontFamily;
        if (fontFamily) {
          // Remove quotes and get first font
          fontFamily = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          
          // Only set font family if it's one of our defined fonts in the toolbar
          const availableFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Tahoma', 'Comic Sans MS', 'Impact', 'Trebuchet MS'];
          
          // Match exact font name
          const matchedFont = availableFonts.find(font => 
            font.toLowerCase() === fontFamily.toLowerCase() ||
            fontFamily.toLowerCase().includes(font.toLowerCase())
          );
          
          if (matchedFont) {
            formats.fontFamily = matchedFont;
          }
        }

        // Detect block format
        const tagName = (element as Element).tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre'].includes(tagName)) {
          formats.blockFormat = tagName;
        } else {
          formats.blockFormat = 'p';
        }
      }

      setActiveFormats(formats);
    } catch (error) {
      console.warn('Error updating active formats:', error);
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

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
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(text => {
          if (text && editorRef.current) {
            editorRef.current.focus();
            
            // Insert the text at cursor position
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(text));
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              // Fallback: insert at the end
              document.execCommand('insertText', false, text);
            }
            handleContentChange();
          }
        }).catch(err => {
          console.warn('Clipboard read failed, using fallback:', err);
          // Fallback to execCommand
          try {
            document.execCommand("paste");
            handleContentChange();
          } catch (error) {
            console.error('Paste operation failed:', error);
          }
        });
      } else {
        // Fallback for older browsers
        try {
          document.execCommand("paste");
          handleContentChange();
        } catch (error) {
          console.error('Paste operation failed:', error);
        }
      }
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
        document.execCommand('insertHTML', false, '<ul class="todo-list"><li><input type="checkbox" style="margin-right: 8px;"> Todo item</li></ul>');
        handleContentChange();
        return;
      }

      if (command === 'indent') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
            ? range.commonAncestorContainer.parentElement 
            : range.commonAncestorContainer as HTMLElement;
          
          if (parentElement) {
            const listItem = parentElement.closest('li');
            if (listItem) {
              // If we're in a list item, increase its padding
              const currentPadding = parseInt(getComputedStyle(listItem).paddingLeft) || 0;
              listItem.style.paddingLeft = `${currentPadding + 20}px`;
            } else {
              // Otherwise, wrap in a div with padding
              const currentContent = range.extractContents();
              const div = document.createElement('div');
              div.style.marginLeft = '20px';
              div.appendChild(currentContent);
              range.insertNode(div);
            }
          }
        }
        handleContentChange();
        return;
      }

      if (command === 'outdent') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
            ? range.commonAncestorContainer.parentElement 
            : range.commonAncestorContainer as HTMLElement;
          
          if (parentElement) {
            const listItem = parentElement.closest('li');
            if (listItem) {
              // If we're in a list item, decrease its padding
              const currentPadding = parseInt(getComputedStyle(listItem).paddingLeft) || 0;
              if (currentPadding > 0) {
                listItem.style.paddingLeft = `${Math.max(0, currentPadding - 20)}px`;
              }
            } else {
              // Otherwise, reduce margin of closest div
              const div = parentElement.closest('div[style*="margin-left"]') as HTMLElement;
              if (div) {
                const currentMargin = parseInt(getComputedStyle(div).marginLeft) || 0;
                if (currentMargin > 0) {
                  div.style.marginLeft = `${Math.max(0, currentMargin - 20)}px`;
                }
              }
            }
          }
        }
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
              tableHTML += `<td style="padding: 12px; border: 1px solid #ccc; min-height: 40px; width: ${width};" contenteditable="true">&nbsp;</td>`;
            }
            tableHTML += '</tr>';
          }
          tableHTML += '</table><br>';
          document.execCommand('insertHTML', false, tableHTML);
          
          // After inserting table, make sure all cells are properly editable
          setTimeout(() => {
            if (editorRef.current) {
              const tableCells = editorRef.current.querySelectorAll('td, th');
              tableCells.forEach(cell => {
                (cell as HTMLElement).contentEditable = 'true';
                (cell as HTMLElement).style.cursor = 'text';
              });
            }
          }, 10);
          
          handleContentChange();
          return;
        }
      }

      if (command === 'formatBlock') {
        if (value === 'blockquote') {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString() || '';
            const blockquoteHTML = `<blockquote style="border-left: 4px solid #007cba; padding-left: 16px; margin: 16px 0; font-style: italic; color: #666;">${selectedText}</blockquote>`;
            document.execCommand('insertHTML', false, blockquoteHTML);
          }
        } else {
          // Handle heading and paragraph formatting
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString() || '';
            
            let elementHTML = '';
            switch (value) {
              case 'h1':
                elementHTML = `<h1 style="font-size: 2em; font-weight: bold; margin: 0.67em 0;">${selectedText || 'Heading 1'}</h1>`;
                break;
              case 'h2':
                elementHTML = `<h2 style="font-size: 1.5em; font-weight: bold; margin: 0.75em 0;">${selectedText || 'Heading 2'}</h2>`;
                break;
              case 'h3':
                elementHTML = `<h3 style="font-size: 1.3em; font-weight: bold; margin: 0.83em 0;">${selectedText || 'Heading 3'}</h3>`;
                break;
              case 'h4':
                elementHTML = `<h4 style="font-size: 1.1em; font-weight: bold; margin: 1.12em 0;">${selectedText || 'Heading 4'}</h4>`;
                break;
              case 'h5':
                elementHTML = `<h5 style="font-size: 0.9em; font-weight: bold; margin: 1.5em 0;">${selectedText || 'Heading 5'}</h5>`;
                break;
              case 'h6':
                elementHTML = `<h6 style="font-size: 0.8em; font-weight: bold; margin: 1.67em 0;">${selectedText || 'Heading 6'}</h6>`;
                break;
              case 'pre':
                elementHTML = `<pre style="font-family: monospace; background: #f5f5f5; padding: 16px; border-radius: 4px; white-space: pre-wrap; margin: 16px 0;">${selectedText || 'Preformatted text'}</pre>`;
                break;
              case 'p':
              default:
                elementHTML = `<div style="margin: 16px 0;">${selectedText || 'Paragraph'}</div>`;
                break;
            }
            
            if (selectedText) {
              document.execCommand('insertHTML', false, elementHTML);
            } else {
              document.execCommand('insertHTML', false, elementHTML + '<br>');
            }
          }
        }
        handleContentChange();
        return;
      }

      if (command === 'insertOrderedList') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // Find if cursor is in a list item
          let currentElement = range.startContainer;
          if (currentElement.nodeType === Node.TEXT_NODE) {
            currentElement = currentElement.parentElement;
          }
          
          const listItem = (currentElement as Element).closest('li');
          const list = listItem?.closest('ol, ul');
          
          if (listItem && list) {
            // Toggle off: convert list back to regular text
            const listItems = Array.from(list.querySelectorAll('li'));
            let replacement = '';
            
            listItems.forEach((item, index) => {
              const text = item.textContent || '';
              replacement += (index > 0 ? '<br>' : '') + text;
            });
            
            // Create a div with the content
            const div = document.createElement('div');
            div.innerHTML = replacement;
            
            // Replace the entire list
            list.parentNode?.replaceChild(div, list);
            
            // Set cursor position
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStart(div, 0);
            newRange.collapse(true);
            selection.addRange(newRange);
          } else {
            const selectedText = selection.toString();
            if (selectedText.trim()) {
              // Split selected text by lines and create list items
              const lines = selectedText.split('\n').filter(line => line.trim());
              let listHTML = '<ol style="margin: 16px 0; padding-left: 20px;">';
              lines.forEach(line => {
                listHTML += `<li>${line.trim()}</li>`;
              });
              listHTML += '</ol>';
              document.execCommand('insertHTML', false, listHTML);
            } else {
              // No selection, insert empty list
              const listHTML = '<ol style="margin: 16px 0; padding-left: 20px;"><li>List item</li></ol>';
              document.execCommand('insertHTML', false, listHTML);
            }
          }
        } else {
          const listHTML = '<ol style="margin: 16px 0; padding-left: 20px;"><li>List item</li></ol>';
          document.execCommand('insertHTML', false, listHTML);
        }
        handleContentChange();
        return;
      }

      if (command === 'insertUnorderedList') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // Find if cursor is in a list item
          let currentElement = range.startContainer;
          if (currentElement.nodeType === Node.TEXT_NODE) {
            currentElement = currentElement.parentElement;
          }
          
          const listItem = (currentElement as Element).closest('li');
          const list = listItem?.closest('ol, ul');
          
          if (listItem && list) {
            // Toggle off: convert list back to regular text
            const listItems = Array.from(list.querySelectorAll('li'));
            let replacement = '';
            
            listItems.forEach((item, index) => {
              const text = item.textContent || '';
              replacement += (index > 0 ? '<br>' : '') + text;
            });
            
            // Create a div with the content
            const div = document.createElement('div');
            div.innerHTML = replacement;
            
            // Replace the entire list
            list.parentNode?.replaceChild(div, list);
            
            // Set cursor position
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStart(div, 0);
            newRange.collapse(true);
            selection.addRange(newRange);
          } else {
            const selectedText = selection.toString();
            if (selectedText.trim()) {
              // Split selected text by lines and create list items
              const lines = selectedText.split('\n').filter(line => line.trim());
              let listHTML = '<ul style="margin: 16px 0; padding-left: 20px;">';
              lines.forEach(line => {
                listHTML += `<li>${line.trim()}</li>`;
              });
              listHTML += '</ul>';
              document.execCommand('insertHTML', false, listHTML);
            } else {
              // No selection, insert empty list
              const listHTML = '<ul style="margin: 16px 0; padding-left: 20px;"><li>List item</li></ul>';
              document.execCommand('insertHTML', false, listHTML);
            }
          }
        } else {
          const listHTML = '<ul style="margin: 16px 0; padding-left: 20px;"><li>List item</li></ul>';
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

      // Handle insertHTML command explicitly
      if (command === 'insertHTML') {
        if (value) {
          console.log('🔍 insertHTML called with value:', value);
          console.log('🔍 Editor ref exists:', !!editorRef.current);
          
          if (editorRef.current) {
            // Force focus using setTimeout to ensure DOM is ready
            setTimeout(() => {
              if (editorRef.current) {
                editorRef.current.focus();
                
                // Create a new range at the end of content
                const selection = window.getSelection();
                const range = document.createRange();
                
                // If editor is empty, just select the content
                if (editorRef.current.innerHTML.trim() === '') {
                  range.selectNodeContents(editorRef.current);
                } else {
                  // Place cursor at the end
                  range.selectNodeContents(editorRef.current);
                  range.collapse(false);
                }
                
                selection?.removeAllRanges();
                selection?.addRange(range);
                
                console.log('🔍 About to insert HTML with focus');
                const result = document.execCommand('insertHTML', false, value);
                console.log('🔍 execCommand result:', result);
                console.log('🔍 Editor content after insert:', editorRef.current.innerHTML);
                
                handleContentChange();
              }
            }, 0);
            return;
          } else {
            console.error('🚨 Editor ref is null!');
          }
        } else {
          console.error('🚨 insertHTML called with empty value!');
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
      } else if (command === "fontSize") {
        if (value) {
          const selection = window.getSelection();
          
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            if (!range.collapsed) {
              // Get the selected content
              const selectedContent = range.extractContents();
              
              // Remove any existing font-size spans from the selected content
              const tempDiv = document.createElement('div');
              tempDiv.appendChild(selectedContent);
              
              // Remove existing font-size styling
              const existingSpans = tempDiv.querySelectorAll('span[style*="font-size"]');
              existingSpans.forEach(span => {
                const spanElement = span as HTMLElement;
                const parent = spanElement.parentNode;
                while (spanElement.firstChild) {
                  parent?.insertBefore(spanElement.firstChild, spanElement);
                }
                parent?.removeChild(spanElement);
              });
              
              // Create new span with font size
              const span = document.createElement('span');
              span.style.setProperty('font-size', value + 'px', 'important');
              
              // Move all content from tempDiv to span
              while (tempDiv.firstChild) {
                span.appendChild(tempDiv.firstChild);
              }
              
              // Insert the span
              range.insertNode(span);
              
              // Select the content again
              const newRange = document.createRange();
              newRange.selectNodeContents(span);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
          
          handleContentChange();
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
    // Handle Enter key in blockquote
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let currentElement = range.startContainer;
        
        if (currentElement.nodeType === Node.TEXT_NODE) {
          currentElement = currentElement.parentElement;
        }
        
        const blockquote = (currentElement as Element)?.closest('blockquote');
        if (blockquote) {
          e.preventDefault();
          
          // Check if this is the second Enter press by looking for an empty line
          const cursorPosition = range.startOffset;
          const textContent = currentElement?.textContent || '';
          const beforeCursor = textContent.substring(0, cursorPosition);
          const afterCursor = textContent.substring(cursorPosition);
          
          // If we're at the end of the blockquote and pressing Enter
          if (afterCursor.trim() === '' && beforeCursor.trim() !== '') {
            // First Enter - add a new line in blockquote
            document.execCommand('insertHTML', false, '<br>');
          } else if (beforeCursor.trim() === '' || (beforeCursor.endsWith('\n') && beforeCursor.trim() === '')) {
            // Second Enter or empty line - exit blockquote
            const newParagraph = '<div style="margin: 16px 0;"><br></div>';
            
            // Insert the new paragraph after the blockquote
            const newElement = document.createElement('div');
            newElement.innerHTML = newParagraph;
            blockquote.parentNode?.insertBefore(newElement.firstChild!, blockquote.nextSibling);
            
            // Move cursor to the new paragraph
            const newRange = document.createRange();
            const newSelection = window.getSelection();
            newRange.setStart(newElement.firstChild!, 0);
            newRange.collapse(true);
            newSelection?.removeAllRanges();
            newSelection?.addRange(newRange);
          } else {
            // Normal Enter behavior within blockquote
            document.execCommand('insertHTML', false, '<br>');
          }
          
          handleContentChange();
          return;
        }
      }
    }

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
      } else {
        // Handle normal text cursor positioning in table cells
        console.log('🔍 Table cell clicked, attempting to position cursor');
        console.log('🔍 Cell:', cell);
        console.log('🔍 Cell contentEditable:', cell.contentEditable);
        console.log('🔍 Click coordinates:', { x: e.clientX, y: e.clientY });
        
        setTimeout(() => {
          const selection = window.getSelection();
          console.log('🔍 Selection available:', !!selection);
          
          if (selection && cell && cell.contentEditable === 'true') {
            console.log('🔍 Focusing cell and positioning cursor');
            cell.focus();
            
            // Create proper cursor position based on click location
            const range = document.createRange();
            const rect = cell.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            console.log('🔍 Click position relative to cell:', { clickX, clickY });
            
            try {
              // Use document.caretPositionFromPoint for more precise positioning
              if ((document as any).caretPositionFromPoint) {
                console.log('🔍 Using caretPositionFromPoint');
                const caretPos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
                if (caretPos) {
                  console.log('🔍 Caret position found:', caretPos);
                  range.setStart(caretPos.offsetNode, caretPos.offset);
                  range.collapse(true);
                }
              } else if ((document as any).caretRangeFromPoint) {
                console.log('🔍 Using caretRangeFromPoint');
                // Fallback for browsers that support caretRangeFromPoint
                const caretRange = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
                if (caretRange) {
                  console.log('🔍 Caret range found:', caretRange);
                  range.setStart(caretRange.startContainer, caretRange.startOffset);
                  range.collapse(true);
                }
              } else {
                console.log('🔍 Using fallback positioning');
                // Final fallback - position cursor based on text content
                const textNodes = Array.from(cell.childNodes).filter(node => 
                  node.nodeType === Node.TEXT_NODE || 
                  (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== 'BR')
                );
                
                console.log('🔍 Text nodes found:', textNodes.length);
                
                if (textNodes.length > 0) {
                  const lastTextNode = textNodes[textNodes.length - 1];
                  if (lastTextNode.nodeType === Node.TEXT_NODE) {
                    range.setStart(lastTextNode, lastTextNode.textContent?.length || 0);
                  } else {
                    range.setStart(lastTextNode, 0);
                  }
                } else {
                  range.selectNodeContents(cell);
                }
                range.collapse(true);
              }
              
              selection.removeAllRanges();
              selection.addRange(range);
              console.log('🔍 Cursor positioned successfully');
            } catch (error) {
              // If positioning fails, just put cursor at the end of the cell
              console.warn('🚨 Cursor positioning failed, using fallback:', error);
              range.selectNodeContents(cell);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            console.log('🚨 Cell focus failed - selection or cell not available');
          }
        }, 0);
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
        <EditorToolbar onCommand={handleCommand} configuration={configuration} activeFormats={activeFormats} />
        {isHtmlView ? (
          <Textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm resize-none border-0 rounded-none"
            placeholder="<p>Enter HTML here...</p>"
          />
        ) : (
          <TextContextMenu onCommand={handleCommand}>
            <div
              ref={editorRef}
              contentEditable
              className={`
                min-h-[300px] p-4 outline-none text-foreground bg-background
                max-w-none
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
          </TextContextMenu>
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