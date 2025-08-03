import React from 'react';
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
import { Type, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, PaintBucket } from 'lucide-react';

interface TextContextMenuProps {
  children: React.ReactNode;
  onCommand: (command: string, value?: string) => void;
}

export const TextContextMenu: React.FC<TextContextMenuProps> = ({ children, onCommand }) => {
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
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
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
  );
};