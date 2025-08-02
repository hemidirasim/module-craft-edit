import { useState, useEffect } from 'react';

interface TableContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAction: (action: string, element: HTMLElement) => void;
  targetElement: HTMLElement | null;
  menuType: 'row' | 'column';
}

export const TableContextMenu = ({ position, onClose, onAction, targetElement, menuType }: TableContextMenuProps) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (position) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position, onClose]);

  if (!position || !targetElement) return null;

  const rowMenuItems = [
    { label: 'Insert row above', action: 'insertRowAbove' },
    { label: 'Insert row below', action: 'insertRowBelow' },
    { label: 'Delete row', action: 'deleteRow' },
    { label: 'Select row', action: 'selectRow' }
  ];

  const columnMenuItems = [
    { label: 'Header column', action: 'headerColumn' },
    { label: 'Insert column left', action: 'insertColumnLeft' },
    { label: 'Insert column right', action: 'insertColumnRight' },
    { label: 'Delete column', action: 'deleteColumn' },
    { label: 'Select column', action: 'selectColumn' }
  ];

  const menuItems = menuType === 'row' ? rowMenuItems : columnMenuItems;

  return (
    <div
      className="fixed bg-background border border-border rounded-md shadow-lg py-2 z-50 min-w-[150px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item) => (
        <button
          key={item.action}
          className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
          onClick={() => {
            onAction(item.action, targetElement);
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};