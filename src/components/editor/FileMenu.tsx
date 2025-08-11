import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, Download, Upload, FileImage, File as FileIcon } from 'lucide-react';
import { exportToPDF, exportToWord, importFromWord } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface FileMenuProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({ content, onContentChange }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      console.log('📄 Starting PDF export...');
      
      const filename = `document-${new Date().toISOString().split('T')[0]}`;
      const success = await exportToPDF(content, filename);
      
      if (success) {
        toast.success('Document exported to PDF successfully!');
      } else {
        toast.error('Failed to export to PDF');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export to PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      console.log('📄 Starting Word export...');
      
      const filename = `document-${new Date().toISOString().split('T')[0]}`;
      const success = await exportToWord(content, filename);
      
      if (success) {
        toast.success('Document exported to Word successfully!');
      } else {
        toast.error('Failed to export to Word');
      }
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('Failed to export to Word');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportWord = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      console.log('📄 Starting Word import...');
      
      const importedContent = await importFromWord(file);
      onContentChange(importedContent);
      
      toast.success('Word document imported successfully!');
    } catch (error) {
      console.error('Word import error:', error);
      toast.error('Failed to import Word document');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden file input for Word import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={handleImportWord}
        style={{ display: 'none' }}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            File
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {/* Import Section */}
          <DropdownMenuItem 
            onClick={triggerFileInput}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import from Word'}
          </DropdownMenuItem>
          
          {/* Export Section */}
          <DropdownMenuItem 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <FileImage className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to PDF'}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleExportWord}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <FileIcon className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to Word'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
