import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Trash2, Edit, Copy } from 'lucide-react';

interface ImageContextMenuProps {
  children: React.ReactNode;
  onDeleteImage: (imageElement: HTMLImageElement) => void;
  onEditImage: (imageElement: HTMLImageElement) => void;
  onCopyImage: (imageElement: HTMLImageElement) => void;
  targetImage: HTMLImageElement | null;
}

export const ImageContextMenu = ({ children, onDeleteImage, onEditImage, onCopyImage, targetImage }: ImageContextMenuProps) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Only allow context menu if clicking on an image
    if (target.tagName !== 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Let the parent handle the image context menu
    return true;
  };

  const handleDeleteClick = () => {
    if (targetImage) {
      onDeleteImage(targetImage);
    }
  };

  const handleEditClick = () => {
    if (targetImage) {
      onEditImage(targetImage);
    }
  };

  const handleCopyClick = () => {
    if (targetImage) {
      onCopyImage(targetImage);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger onContextMenu={handleContextMenu}>{children}</ContextMenuTrigger>
      {targetImage && (
        <ContextMenuContent>
          <ContextMenuItem onClick={handleEditClick}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Image
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyClick}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Image
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDeleteClick} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Image
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};