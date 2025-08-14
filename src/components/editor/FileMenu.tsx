import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FileText, Download, Upload, FileImage, File as FileIcon, Bug, ChevronDown } from 'lucide-react';
import { exportToPDF, exportToWord, importFromWord, testWordImport } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface FileMenuProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({ content = "", onContentChange }) => {
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

  const handleTestWordImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      console.log('🧪 Starting Word import test...');
      
      const testResult = await testWordImport(file);
      console.log('🧪 Test completed:', testResult);
      
      // Show test results in toast
      const hasContent = testResult.extractedContent && testResult.extractedContent.length > 0;
      if (hasContent) {
        toast.success(`Test successful! Content length: ${testResult.extractedContent.length} characters`);
      } else {
        toast.error('Test failed: No content extracted');
      }
      
      // Also log detailed results
      console.log('🧪 Detailed test results:', JSON.stringify(testResult, null, 2));
      
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  const triggerTestInput = () => {
    // Create a new file input for testing
    const testInput = document.createElement('input');
    testInput.type = 'file';
    testInput.accept = '.docx';
    testInput.onchange = handleTestWordImport;
    testInput.click();
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
          <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-accent flex items-center gap-2">
            <FileText className="h-4 w-4" />
            File
            <ChevronDown size={12} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-background border border-border shadow-lg z-50">
          {/* Import Section */}
          <DropdownMenuItem 
            onClick={triggerFileInput}
            disabled={isImporting}
            className="cursor-pointer hover:bg-accent flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import from Word'}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={triggerTestInput}
            disabled={isImporting}
            className="cursor-pointer hover:bg-accent flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            {isImporting ? 'Testing...' : 'Test Word Import'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Export Section */}
          <DropdownMenuItem 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="cursor-pointer hover:bg-accent flex items-center gap-2"
          >
            <FileImage className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to PDF'}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleExportWord}
            disabled={isExporting}
            className="cursor-pointer hover:bg-accent flex items-center gap-2"
          >
            <FileIcon className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to Word'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
