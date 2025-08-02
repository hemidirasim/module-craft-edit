import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface TableContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAction: (action: string, element: HTMLElement) => void;
  targetElement: HTMLElement | null;
}

export const TableContextMenu = ({ position, onClose, onAction, targetElement }: TableContextMenuProps) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);

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
    { label: 'Delete row', action: 'deleteRow' }
  ];

  const columnMenuItems = [
    { label: 'Header column', action: 'headerColumn' },
    { label: 'Insert column left', action: 'insertColumnLeft' },
    { label: 'Insert column right', action: 'insertColumnRight' },
    { label: 'Delete column', action: 'deleteColumn' }
  ];

  return (
    <div
      className="fixed bg-background border border-border rounded-md shadow-lg py-2 z-50 min-w-[120px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Row Menu */}
      <div
        className="relative"
        onMouseEnter={() => setHoveredSubmenu('row')}
        onMouseLeave={() => setHoveredSubmenu(null)}
      >
        <div className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between cursor-pointer">
          Row
          <ChevronRight size={16} />
        </div>
        
        {hoveredSubmenu === 'row' && (
          <div
            className="absolute left-full top-0 bg-background border border-border rounded-md shadow-lg py-2 min-w-[150px] ml-1"
            style={{ zIndex: 51 }}
          >
            {rowMenuItems.map((item) => (
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
        )}
      </div>

      {/* Column Menu */}
      <div
        className="relative"
        onMouseEnter={() => setHoveredSubmenu('column')}
        onMouseLeave={() => setHoveredSubmenu(null)}
      >
        <div className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between cursor-pointer">
          Column
          <ChevronRight size={16} />
        </div>
        
        {hoveredSubmenu === 'column' && (
          <div
            className="absolute left-full top-0 bg-background border border-border rounded-md shadow-lg py-2 min-w-[150px] ml-1"
            style={{ zIndex: 51 }}
          >
            {columnMenuItems.map((item) => (
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
        )}
      </div>
    </div>
  );
};