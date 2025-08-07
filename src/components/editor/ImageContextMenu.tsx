import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Trash2, Edit, Copy } from 'lucide-react';

interface ImageContextMenuProps {
  children: React.ReactNode;
  onDeleteImage: () => void;
  onEditImage: () => void;
  onCopyImage: () => void;
}

export const ImageContextMenu = ({ children, onDeleteImage, onEditImage, onCopyImage }: ImageContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEditImage}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Image
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyImage}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Image
        </ContextMenuItem>
        <ContextMenuItem onClick={onDeleteImage} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Image
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};