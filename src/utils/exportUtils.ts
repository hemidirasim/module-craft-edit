import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qgmluixnzhpthywyrytn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lydG4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDI5NzE5NywiZXhwIjoyMDUwODczMTk3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

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
            // For images, try to get the actual image data
            const imgElement = element as HTMLImageElement;
            const altText = imgElement.alt || 'Image';
            const src = imgElement.src;
            
            try {
              // Create a placeholder for now - Word export with images requires more complex handling
              results.push(new Paragraph({
                children: [new TextRun(`[Image: ${altText} - ${src}]`)],
              }));
            } catch (error) {
              results.push(new Paragraph({
                children: [new TextRun(`[Image: ${altText}]`)],
              }));
            }
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

// Helper function to load image with retry mechanism
const loadImageWithRetry = (src: string, maxRetries: number = 3): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const attemptLoad = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        retries++;
        if (retries < maxRetries) {
          console.warn(`Image load attempt ${retries} failed for ${src}, retrying...`);
          setTimeout(attemptLoad, 1000 * retries); // Exponential backoff
        } else {
          reject(new Error(`Failed to load image after ${maxRetries} attempts: ${src}`));
        }
      };
      
      img.src = src;
    };
    
    attemptLoad();
  });
};

// Helper function to convert image to base64 with fallback
const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    // Check if it's a Supabase signed URL
    if (imageUrl.includes('supabase.co') && imageUrl.includes('token=')) {
      // For Supabase signed URLs, try direct fetch first
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Supabase image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    // For other URLs, try direct fetch
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Direct fetch failed, trying proxy:', error);
    
    try {
      // Second try: Use a CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${imageUrl}`;
      const response = await fetch(proxyUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Proxy fetch failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (proxyError) {
      console.warn('Proxy fetch also failed:', proxyError);
      throw proxyError;
    }
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
    
    // Convert all images to base64 to avoid CORS issues
    const images = tempDiv.querySelectorAll('img');
    const imageConversionPromises = Array.from(images).map(async (img, index) => {
      const imgElement = img as HTMLImageElement;
      
      try {
        // Skip if already a data URL
        if (imgElement.src.startsWith('data:')) {
          console.log(`Image ${index + 1}: Already a data URL, skipping conversion`);
          return;
        }
        
        console.log(`Image ${index + 1}: Converting ${imgElement.src} to base64...`);
        
        // Convert image to base64 with fallback
        const base64Data = await convertImageToBase64(imgElement.src);
        imgElement.src = base64Data;
        console.log(`Image ${index + 1}: Successfully converted to base64`);
      } catch (error) {
        console.warn(`Image ${index + 1}: Failed to convert image to base64:`, imgElement.src, error);
        // Create a placeholder for failed images
        imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        imgElement.alt = 'Image failed to load';
      }
    });
    
    // Wait for all image conversions
    console.log(`Starting conversion of ${images.length} images...`);
    await Promise.all(imageConversionPromises);
    console.log('All image conversions completed');
    
    // Style images properly for export
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      imgElement.style.maxWidth = '100%';
      imgElement.style.height = 'auto';
      imgElement.style.display = 'block';
      imgElement.style.margin = '10px 0';
      imgElement.style.objectFit = 'contain';
      imgElement.crossOrigin = 'anonymous';
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
    
    // Wait for images to load with retry mechanism
    const imageLoadPromises = Array.from(images).map(async (img, index) => {
      const imgElement = img as HTMLImageElement;
      
      try {
        if (imgElement.complete && imgElement.naturalHeight !== 0) {
          console.log(`Image ${index + 1}: Already loaded`);
          return true;
        }
        
        console.log(`Image ${index + 1}: Waiting for load...`);
        await loadImageWithRetry(imgElement.src, 3);
        console.log(`Image ${index + 1}: Successfully loaded`);
        return true;
      } catch (error) {
        console.warn(`Image ${index + 1}: Failed to load after retries:`, error);
        return true; // Continue with PDF generation even if some images fail
      }
    });
    
    await Promise.all(imageLoadPromises);
    console.log('All images processed');
    
    // Additional wait to ensure rendering is complete
    console.log('Waiting for final rendering...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Convert to canvas with improved options
    console.log('Converting to canvas...');
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure proper styling in cloned document
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach(img => {
          (img as HTMLElement).style.maxWidth = '100%';
          (img as HTMLElement).style.height = 'auto';
          (img as HTMLElement).style.objectFit = 'contain';
          (img as HTMLElement).style.display = 'block';
          (img as HTMLElement).style.margin = '10px 0';
        });
        
        const clonedTables = clonedDoc.querySelectorAll('table');
        clonedTables.forEach(table => {
          (table as HTMLElement).style.border = '1px solid #000';
        });
      }
    });
    
    console.log('Canvas created successfully');
    document.body.removeChild(tempDiv);
    
    // Create PDF with high quality
    console.log('Creating PDF...');
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
    console.log('Saving PDF...');
    pdf.save(`${filename}.pdf`);
    console.log('PDF export completed successfully');
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};