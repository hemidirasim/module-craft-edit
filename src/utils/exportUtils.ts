import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToWord = async (content: string, filename: string = 'document') => {
  try {
    // Create a temporary div to parse HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const children = [];
    
    // Process all child nodes recursively
    const processNode = (node: Node): any[] => {
      const results = [];
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          results.push(new TextRun(text));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h1':
            const h1Text = element.textContent?.trim() || '';
            if (h1Text) {
              results.push(new Paragraph({
                text: h1Text,
                heading: 1 as any,
              }));
            }
            break;
          case 'h2':
            const h2Text = element.textContent?.trim() || '';
            if (h2Text) {
              results.push(new Paragraph({
                text: h2Text,
                heading: 2 as any,
              }));
            }
            break;
          case 'h3':
            const h3Text = element.textContent?.trim() || '';
            if (h3Text) {
              results.push(new Paragraph({
                text: h3Text,
                heading: 3 as any,
              }));
            }
            break;
            
          case 'img':
            // For images, we'll add a placeholder text
            const altText = (element as HTMLImageElement).alt || 'Image';
            results.push(new Paragraph({
              children: [new TextRun(`[Image: ${altText}]`)],
            }));
            break;
            
          case 'p':
          case 'div':
            const textContent = element.textContent?.trim();
            if (textContent) {
              results.push(new Paragraph({
                children: [new TextRun(textContent)],
              }));
            }
            break;
            
          case 'br':
            results.push(new Paragraph({
              children: [new TextRun('')],
            }));
            break;
            
          case 'table':
            // Convert table to text representation
            const tableText = element.textContent?.trim();
            if (tableText) {
              results.push(new Paragraph({
                children: [new TextRun(`Table: ${tableText}`)],
              }));
            }
            break;
            
          case 'pre':
          case 'code':
            // Convert code blocks to text
            const codeText = element.textContent?.trim();
            if (codeText) {
              results.push(new Paragraph({
                children: [new TextRun(`Code: ${codeText}`)],
              }));
            }
            break;
            
          default:
            // Process child nodes for other elements
            for (const child of Array.from(element.childNodes)) {
              const childResults = processNode(child);
              results.push(...childResults);
            }
            break;
        }
      }
      
      return results;
    };
    
    // Process all nodes
    for (const child of Array.from(tempDiv.childNodes)) {
      const processedNodes = processNode(child);
      children.push(...processedNodes);
    }
    
    // If no content was processed, add a default paragraph
    if (children.length === 0) {
      children.push(new Paragraph({
        children: [new TextRun('Document content')],
      }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Word:', error);
    return false;
  }
};

export const exportToPDF = async (content: string, filename: string = 'document') => {
  try {
    // Create a temporary div to render content for PDF
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.style.cssText = `
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #000;
      background: #fff;
      padding: 20px;
      max-width: 800px;
      min-height: 500px;
      position: absolute;
      top: -9999px;
      left: -9999px;
      z-index: -1;
    `;
    
    // Style images properly for export
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      (img as HTMLElement).style.maxWidth = '100%';
      (img as HTMLElement).style.height = 'auto';
      (img as HTMLElement).style.display = 'block';
      (img as HTMLElement).style.margin = '10px 0';
      (img as HTMLElement).style.objectFit = 'contain';
    });
    
    // Style tables
    const tables = tempDiv.querySelectorAll('table');
    tables.forEach(table => {
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.border = '1px solid #ccc';
    });
    
    // Style code blocks
    const codeBlocks = tempDiv.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
      (pre as HTMLElement).style.whiteSpace = 'pre-wrap';
      (pre as HTMLElement).style.wordWrap = 'break-word';
      (pre as HTMLElement).style.backgroundColor = '#f8f9fa';
      (pre as HTMLElement).style.padding = '12px';
      (pre as HTMLElement).style.borderRadius = '4px';
    });
    
    document.body.appendChild(tempDiv);
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Ensure all images are loaded
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if ((img as HTMLImageElement).complete) {
          resolve(true);
        } else {
          img.addEventListener('load', () => resolve(true));
          img.addEventListener('error', () => resolve(true));
          // Timeout fallback
          setTimeout(() => resolve(true), 3000);
        }
      });
    });
    
    await Promise.all(imagePromises);
    
    // Convert to canvas with improved options
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 1.2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      foreignObjectRendering: true,
      onclone: (clonedDoc) => {
        // Ensure proper styling in cloned document
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach(img => {
          (img as HTMLElement).style.maxWidth = '100%';
          (img as HTMLElement).style.height = 'auto';
          (img as HTMLElement).style.objectFit = 'contain';
        });
        
        const clonedTables = clonedDoc.querySelectorAll('table');
        clonedTables.forEach(table => {
          (table as HTMLElement).style.border = '1px solid #000';
        });
      }
    });
    
    document.body.removeChild(tempDiv);
    
    // Create PDF with high quality
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15;
    const imgWidth = pageWidth - (2 * margin);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let yPosition = margin;
    let remainingHeight = imgHeight;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    remainingHeight -= (pageHeight - 2 * margin);
    
    // Add additional pages if content overflows
    while (remainingHeight > 0) {
      pdf.addPage();
      yPosition = margin - (imgHeight - remainingHeight);
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      remainingHeight -= (pageHeight - 2 * margin);
    }
    
    // Download the PDF
    pdf.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};