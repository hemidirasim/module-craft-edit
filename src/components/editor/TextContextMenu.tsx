import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { LinkDialog } from './LinkDialog';
import { ImageDialog } from './ImageDialog';
import { DocumentDialog } from './DocumentDialog';
import { Type, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, PaintBucket, Link, Link2Off, Image, FileText } from 'lucide-react';

interface TextContextMenuProps {
  children: React.ReactNode;
  onCommand: (command: string, value?: string) => void;
}

export const TextContextMenu: React.FC<TextContextMenuProps> = ({ children, onCommand }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [isInLink, setIsInLink] = useState(false);

  const checkIfInLink = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let element = range.commonAncestorContainer;
      
      // If it's a text node, get the parent element
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }
      
      // Check if we're inside a link
      const linkElement = (element as Element).closest('a');
      setIsInLink(!!linkElement);
    }
  };

  const handleCreateLink = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = selection.toString() || '';
      setSelectedText(text);
      setSavedSelection(range.cloneRange());
      setShowLinkDialog(true);
    }
  };

  const handleInsertLink = (linkData: { text: string; url: string; target?: string; title?: string }) => {
    if (savedSelection) {
      // Restore the selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
        
        // Create the link HTML
        const { text, url, target, title } = linkData;
        const linkHTML = `<a href="${url}"${target ? ` target="${target}"` : ''}${title ? ` title="${title}"` : ''} style="color: #007cba; text-decoration: underline;">${text}</a>`;
        
        // Replace the selected content with the link
        document.execCommand('insertHTML', false, linkHTML);
        
        // Clear the saved selection
        setSavedSelection(null);
      }
    }
  };

  const handleRemoveLink = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let element = range.commonAncestorContainer;
      
      // If it's a text node, get the parent element
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }
      
      // Find the link element
      const linkElement = (element as Element).closest('a') as HTMLAnchorElement;
      if (linkElement) {
        // Replace the link with its text content
        const textNode = document.createTextNode(linkElement.textContent || '');
        linkElement.parentNode?.replaceChild(textNode, linkElement);
      }
    }
  };

  const handleInsertImage = (imageData: { src: string; alt: string; width?: string; height?: string }) => {
    // Get current selection position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Create image HTML
      const { src, alt, width, height } = imageData;
      let imageHTML = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;`;
      
      if (width) {
        imageHTML += ` width: ${width};`;
      }
      if (height) {
        imageHTML += ` height: ${height};`;
      }
      
      imageHTML += `" />`;
      
      // Insert the image at current cursor position
      range.deleteContents();
      range.insertNode(range.createContextualFragment(imageHTML));
      
      // Move cursor after the image
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Fallback: use execCommand if no selection
      const { src, alt, width, height } = imageData;
      let imageHTML = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;`;
      
      if (width) {
        imageHTML += ` width: ${width};`;
      }
      if (height) {
        imageHTML += ` height: ${height};`;
      }
      
      imageHTML += `" />`;
      
      document.execCommand('insertHTML', false, imageHTML);
    }
  };

  const handleInsertDocument = (documentData: { 
    src: string; 
    name: string; 
    type: string; 
    size?: string;
    downloadText: string;
    documentText: string;
  }) => {
    const { src, name, type, size, downloadText, documentText } = documentData;
    
    // Create a simpler document HTML structure
    const documentHTML = `<div style="display: inline-block; padding: 12px 16px; margin: 8px 0; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb; cursor: pointer; max-width: 100%;" onclick="window.open('${src}', '_blank')">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="padding: 8px; background: #3b82f6; border-radius: 6px; color: white; font-size: 14px; font-weight: 600;">📄</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 2px;">${name}</div>
          <div style="font-size: 12px; color: #6b7280;">${documentText}${size ? ` • ${size}` : ""}</div>
        </div>
        <div style="padding: 4px 8px; background: #e5e7eb; border-radius: 4px; font-size: 12px; color: #374151;">${downloadText}</div>
      </div>
    </div><br>`;
    
    // Use the onCommand function to ensure proper insertion
    onCommand('insertHTML', documentHTML);
  };

  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
  const fontFamilies = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
  ];
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Gray', value: '#6b7280' },
  ];
  const backgroundColors = [
    { name: 'None', value: 'transparent' },
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Green', value: '#d1fae5' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Red', value: '#fee2e2' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Gray', value: '#f3f4f6' },
  ];

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger 
          onContextMenu={checkIfInLink}
        >
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => onCommand('bold')}>
            <Bold className="mr-2 h-4 w-4" />
            Bold
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCommand('italic')}>
            <Italic className="mr-2 h-4 w-4" />
            Italic
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCommand('underline')}>
            <Underline className="mr-2 h-4 w-4" />
            Underline
          </ContextMenuItem>
          
          {isInLink ? (
            <ContextMenuItem onClick={handleRemoveLink}>
              <Link2Off className="mr-2 h-4 w-4" />
              Remove Link
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={handleCreateLink}>
              <Link className="mr-2 h-4 w-4" />
              Add Link
            </ContextMenuItem>
          )}
          
          <ContextMenuItem onClick={() => setShowImageDialog(true)}>
            <Image className="mr-2 h-4 w-4" />
            Insert Image
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => setShowDocumentDialog(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Insert Document
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Type className="mr-2 h-4 w-4" />
              Font Size
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {fontSizes.map((size) => (
                <ContextMenuItem key={size} onClick={() => onCommand('fontSize', size.replace('px', ''))}>
                  {size}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Type className="mr-2 h-4 w-4" />
              Font Family
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {fontFamilies.map((font) => (
                <ContextMenuItem key={font.value} onClick={() => onCommand('fontName', font.value)}>
                  <span style={{ fontFamily: font.value }}>{font.name}</span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              Font Color
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {colors.map((color) => (
                <ContextMenuItem key={color.value} onClick={() => onCommand('foreColor', color.value)}>
                  <div className="mr-2 h-4 w-4 rounded border" style={{ backgroundColor: color.value }} />
                  {color.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <PaintBucket className="mr-2 h-4 w-4" />
              Background Color
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {backgroundColors.map((color) => (
                <ContextMenuItem key={color.value} onClick={() => onCommand('hiliteColor', color.value)}>
                  <div className="mr-2 h-4 w-4 rounded border" style={{ backgroundColor: color.value }} />
                  {color.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={() => onCommand('justifyLeft')}>
            <AlignLeft className="mr-2 h-4 w-4" />
            Align Left
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCommand('justifyCenter')}>
            <AlignCenter className="mr-2 h-4 w-4" />
            Align Center
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCommand('justifyRight')}>
            <AlignRight className="mr-2 h-4 w-4" />
            Align Right
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onInsertLink={handleInsertLink}
        selectedText={selectedText}
      />
      
      <ImageDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onInsertImage={handleInsertImage}
      />
      
      <DocumentDialog
        open={showDocumentDialog}
        onOpenChange={setShowDocumentDialog}
        onInsertDocument={handleInsertDocument}
      />
    </>
  );
};