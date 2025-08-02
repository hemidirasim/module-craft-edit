import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table } from 'lucide-react';

interface TableSelectorProps {
  onTableSelect: (rows: number, cols: number) => void;
}

export const TableSelector = ({ onTableSelect }: TableSelectorProps) => {
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);
  
  const maxRows = 10;
  const maxCols = 10;

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col });
  };

  const handleCellClick = (row: number, col: number) => {
    onTableSelect(row + 1, col + 1);
    setHoveredCell(null);
  };

  const isSelected = (row: number, col: number) => {
    if (!hoveredCell) return false;
    return row <= hoveredCell.row && col <= hoveredCell.col;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent"
          title="Insert Table"
        >
          <Table size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-background border border-border shadow-lg z-50">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Insert Table</h4>
          
          <div className="grid grid-cols-10 gap-1 p-2 border rounded">
            {Array.from({ length: maxRows }, (_, row) =>
              Array.from({ length: maxCols }, (_, col) => (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  className={`
                    w-4 h-4 border border-border rounded transition-colors
                    ${isSelected(row, col) 
                      ? 'bg-primary border-primary' 
                      : 'bg-background hover:bg-accent'
                    }
                  `}
                  onMouseEnter={() => handleCellHover(row, col)}
                  onClick={() => handleCellClick(row, col)}
                />
              ))
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {hoveredCell 
              ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1}` 
              : 'Hover to preview size'
            }
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};