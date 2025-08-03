import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table } from 'lucide-react';
interface TableSelectorProps {
  onTableSelect: (rows: number, cols: number) => void;
}
export const TableSelector = ({
  onTableSelect
}: TableSelectorProps) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const maxRows = 10;
  const maxCols = 10;
  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({
      row,
      col
    });
  };
  const handleCellClick = (row: number, col: number) => {
    onTableSelect(row + 1, col + 1);
    setHoveredCell(null);
  };
  const isSelected = (row: number, col: number) => {
    if (!hoveredCell) return false;
    return row <= hoveredCell.row && col <= hoveredCell.col;
  };
  return <Popover>
      <PopoverTrigger asChild>
        
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-background border border-border shadow-lg z-50">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Insert Table</h4>
          
          <div className="inline-grid grid-cols-10 gap-0.5 p-2 border rounded bg-muted/10">
            {Array.from({
            length: maxRows
          }, (_, row) => Array.from({
            length: maxCols
          }, (_, col) => <button key={`${row}-${col}`} type="button" className={`
                    w-5 h-5 border border-border/50 transition-all duration-150 ease-in-out
                    ${isSelected(row, col) ? 'bg-primary border-primary shadow-sm' : 'bg-background hover:bg-accent hover:border-accent-foreground/20'}
                  `} onMouseEnter={() => handleCellHover(row, col)} onClick={() => handleCellClick(row, col)} />))}
          </div>
          
          <div className="text-center text-sm text-muted-foreground min-h-[20px] flex items-center justify-center">
            {hoveredCell ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1} table` : 'Hover to preview table size'}
          </div>
        </div>
      </PopoverContent>
    </Popover>;
};