import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
// import { supabase } from '@/integrations/supabase/client'; // Deprecated - using new auth system
import { addDemoFile } from './demoUtils';

// Import from Word function using mammoth.js with image upload
export const importFromWord = async (file: File): Promise<string> => {
  try {
    console.log('📄 Starting Word import process with mammoth.js...');
    console.log('📄 File name:', file.name);
    console.log('📄 File size:', file.size, 'bytes');
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      throw new Error('Please select a .docx file');
    }
    
    // Use mammoth.js to convert Word to HTML
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    console.log('✅ Mammoth.js conversion completed');
    console.log('📄 Extracted HTML length:', result.value.length);
    console.log('📄 HTML preview:', result.value.substring(0, 200) + '...');
    
    // Check for any messages from mammoth
    if (result.messages.length > 0) {
      console.log('📋 Mammoth messages:', result.messages);
    }
    
    // Validate extracted content
    if (!result.value || result.value.trim().length === 0) {
      console.warn('⚠️ Extracted content is empty');
      return '<p>No content could be extracted from the Word document. Please check if the file contains text content.</p>';
    }
    
    // Clean up the HTML content and upload images
    const cleanedHtml = await cleanWordHtmlWithImageUpload(result.value);
    
    console.log('✅ Word import completed successfully');
    console.log('📄 Final HTML length:', cleanedHtml.length);
    
    return cleanedHtml;
  } catch (error) {
    console.error('❌ Error importing from Word:', error);
    throw new Error(`Failed to import Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Upload image to Supabase storage
const uploadImageToServer = async (base64Data: string, filename: string): Promise<string> => {
  try {
    console.log('📤 Uploading image to server:', filename);
    
    // Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    // Create unique filename
    const timestamp = Date.now();
    const uniqueFilename = `demo_${timestamp}_${filename}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('lovable-uploads')
      .upload(uniqueFilename, blob, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lovable-uploads')
      .getPublicUrl(uniqueFilename);
    
    // Add to demo files if in demo mode
    try {
      await addDemoFile(
        filename,
        blob.type,
        blob.size,
        urlData.publicUrl,
        uniqueFilename
      );
      console.log('✅ Image added to demo files');
    } catch (demoError) {
      console.warn('⚠️ Could not add to demo files:', demoError);
    }
    
    console.log('✅ Image uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

// Clean up HTML content from Word with image upload to server
const cleanWordHtmlWithImageUpload = async (html: string): Promise<string> => {
  try {
    // Create a temporary div to parse and clean the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove only truly unnecessary Word-specific elements
    const elementsToRemove = tempDiv.querySelectorAll('o:p, w:sdt, w:sdtContent, w:sdtPr, w:sdtEndPr');
    elementsToRemove.forEach(el => el.remove());
    
    // Process images and upload them to server
    const images = tempDiv.querySelectorAll('img');
    console.log(`🖼️ Found ${images.length} images in Word document`);
    
    for (const img of images) {
      const imgElement = img as HTMLImageElement;
      const src = imgElement.src;
      
      // Check if it's a base64 data URL
      if (src.startsWith('data:image/')) {
        try {
          console.log('📤 Processing base64 image for upload...');
          
          // Extract file extension from data URL
          const match = src.match(/data:image\/([^;]+);base64,/);
          const extension = match ? match[1] : 'png';
          const filename = `word_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
          
          // Upload image to server
          const serverUrl = await uploadImageToServer(src, filename);
          
          // Replace src with server URL
          imgElement.src = serverUrl;
          console.log('✅ Image replaced with server URL:', serverUrl);
          
      } catch (error) {
          console.error('❌ Error processing image:', error);
          // Keep original src if upload fails
        }
      } else if (src.startsWith('blob:')) {
        try {
          console.log('📤 Processing blob image for upload...');
          
          // Convert blob to base64
          const response = await fetch(src);
          const blob = await response.blob();
          const reader = new FileReader();
          
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(blob);
          const base64Data = await base64Promise;
          
          // Extract file extension
          const match = base64Data.match(/data:image\/([^;]+);base64,/);
          const extension = match ? match[1] : 'png';
          const filename = `word_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
          
          // Upload image to server
          const serverUrl = await uploadImageToServer(base64Data, filename);
          
          // Replace src with server URL
          imgElement.src = serverUrl;
          console.log('✅ Blob image replaced with server URL:', serverUrl);
          
        } catch (error) {
          console.error('❌ Error processing blob image:', error);
          // Keep original src if upload fails
        }
      }
    }
    
    // Clean up style attributes while preserving colors and important formatting
    const elementsWithStyles = tempDiv.querySelectorAll('[style]');
    elementsWithStyles.forEach(el => {
      const element = el as HTMLElement;
      let style = element.getAttribute('style') || '';
      
      // Convert Word color formats to hex
      style = style.replace(/color:\s*#([0-9A-Fa-f]{6})/g, (match, color) => {
        // Word sometimes uses BGR format, convert to RGB
        const r = color.substring(4, 6);
        const g = color.substring(2, 4);
        const b = color.substring(0, 2);
        return `color: #${r}${g}${b}`;
      });
      
      // Convert pt to px for font sizes
      style = style.replace(/font-size:\s*(\d+(?:\.\d+)?)pt/g, (match, pt) => {
        const px = Math.round(parseFloat(pt) * 1.333);
        return `font-size: ${px}px`;
      });
      
      // Convert Word highlight colors to background colors
      const highlightColors: { [key: string]: string } = {
        'yellow': '#FFFF00',
        'green': '#00FF00',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF',
        'blue': '#0000FF',
        'red': '#FF0000',
        'darkBlue': '#000080',
        'darkCyan': '#008080',
        'darkGreen': '#008000',
        'darkMagenta': '#800080',
        'darkRed': '#800000',
        'darkYellow': '#808000',
        'darkGray': '#808080',
        'lightGray': '#C0C0C0',
        'black': '#000000',
        'white': '#FFFFFF'
      };
      
      Object.entries(highlightColors).forEach(([wordColor, hexColor]) => {
        style = style.replace(new RegExp(`background-color:\\s*${wordColor}`, 'gi'), `background-color: ${hexColor}`);
      });
      
      // Apply cleaned style
      if (style) {
        element.setAttribute('style', style);
      } else {
        element.removeAttribute('style');
      }
    });
    
    // Convert Word headings to proper HTML headings based on style and text length
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.textContent?.trim() || '';
      const style = p.getAttribute('style') || '';
      
      // Check if it's a heading based on style or text characteristics
      let headingLevel = 0;
      
      if (style.includes('font-weight: bold') || style.includes('font-weight:bold')) {
        if (text.length < 50) headingLevel = 1;
        else if (text.length < 100) headingLevel = 2;
        else headingLevel = 3;
      } else if (text.length < 30 && text === text.toUpperCase()) {
        headingLevel = 1;
      } else if (text.length < 60 && /^[A-Z][A-Z\s]+$/.test(text)) {
        headingLevel = 2;
      }
      
      if (headingLevel > 0) {
        const heading = document.createElement(`h${headingLevel}`);
        heading.innerHTML = p.innerHTML;
        p.parentNode?.replaceChild(heading, p);
      }
    });
    
    // Clean up lists
    const listItems = tempDiv.querySelectorAll('li');
    listItems.forEach(li => {
      // Remove Word-specific list markers
      const text = li.textContent || '';
      li.textContent = text.replace(/^[\d\-•\*]\s*/, '');
    });
    
    // Group consecutive list items into ul/ol
    const listGroups = tempDiv.querySelectorAll('li');
    let currentList: HTMLElement | null = null;
    
    listGroups.forEach(li => {
      const parent = li.parentElement;
      if (parent && parent.tagName !== 'UL' && parent.tagName !== 'OL') {
        if (!currentList) {
          currentList = document.createElement('ul');
          parent.insertBefore(currentList, li);
        }
        currentList.appendChild(li);
      } else {
        currentList = null;
      }
    });
    
    return tempDiv.innerHTML;
  } catch (error) {
    console.warn('⚠️ Error cleaning Word HTML:', error);
    return html;
  }
};

// Clean up HTML content from Word while preserving colors and formatting
const cleanWordHtml = (html: string): string => {
  try {
    // Create a temporary div to parse and clean the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove only truly unnecessary Word-specific elements
    const elementsToRemove = tempDiv.querySelectorAll('o:p, w:sdt, w:sdtContent, w:sdtPr, w:sdtEndPr');
    elementsToRemove.forEach(el => el.remove());
    
    // Clean up style attributes while preserving colors and important formatting
    const elementsWithStyles = tempDiv.querySelectorAll('[style]');
    elementsWithStyles.forEach(el => {
      const element = el as HTMLElement;
      let style = element.getAttribute('style') || '';
      
      // Convert Word color formats to hex
      style = style.replace(/color:\s*#([0-9A-Fa-f]{6})/g, (match, color) => {
        // Word sometimes uses BGR format, convert to RGB
        const r = color.substring(4, 6);
        const g = color.substring(2, 4);
        const b = color.substring(0, 2);
        return `color: #${r}${g}${b}`;
      });
      
      // Convert pt to px for font sizes
      style = style.replace(/font-size:\s*(\d+(?:\.\d+)?)pt/g, (match, pt) => {
        const px = Math.round(parseFloat(pt) * 1.333);
        return `font-size: ${px}px`;
      });
      
      // Convert Word highlight colors to background colors
    const highlightColors: { [key: string]: string } = {
      'yellow': '#FFFF00',
      'green': '#00FF00',
      'cyan': '#00FFFF',
      'magenta': '#FF00FF',
      'blue': '#0000FF',
      'red': '#FF0000',
      'darkBlue': '#000080',
      'darkCyan': '#008080',
      'darkGreen': '#008000',
      'darkMagenta': '#800080',
      'darkRed': '#800000',
      'darkYellow': '#808000',
      'darkGray': '#808080',
      'lightGray': '#C0C0C0',
      'black': '#000000',
      'white': '#FFFFFF'
    };
    
      Object.entries(highlightColors).forEach(([wordColor, hexColor]) => {
        style = style.replace(new RegExp(`background-color:\\s*${wordColor}`, 'gi'), `background-color: ${hexColor}`);
      });
      
      // Apply cleaned style
      if (style) {
        element.setAttribute('style', style);
    } else {
        element.removeAttribute('style');
      }
    });
    
    // Convert Word headings to proper HTML headings based on style and text length
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.textContent?.trim() || '';
      const style = p.getAttribute('style') || '';
      
      // Check if it's a heading based on style or text characteristics
      let headingLevel = 0;
      
      if (style.includes('font-weight: bold') || style.includes('font-weight:bold')) {
        if (text.length < 50) headingLevel = 1;
        else if (text.length < 100) headingLevel = 2;
        else headingLevel = 3;
      } else if (text.length < 30 && text === text.toUpperCase()) {
        headingLevel = 1;
      } else if (text.length < 60 && /^[A-Z][A-Z\s]+$/.test(text)) {
        headingLevel = 2;
      }
      
      if (headingLevel > 0) {
        const heading = document.createElement(`h${headingLevel}`);
        heading.innerHTML = p.innerHTML;
        p.parentNode?.replaceChild(heading, p);
      }
    });
    
    // Clean up lists
    const listItems = tempDiv.querySelectorAll('li');
    listItems.forEach(li => {
      // Remove Word-specific list markers
      const text = li.textContent || '';
      li.textContent = text.replace(/^[\d\-•\*]\s*/, '');
    });
    
    // Group consecutive list items into ul/ol
    const listGroups = tempDiv.querySelectorAll('li');
    let currentList: HTMLElement | null = null;
    
    listGroups.forEach(li => {
      const parent = li.parentElement;
      if (parent && parent.tagName !== 'UL' && parent.tagName !== 'OL') {
        if (!currentList) {
          currentList = document.createElement('ul');
          parent.insertBefore(currentList, li);
        }
        currentList.appendChild(li);
      } else {
        currentList = null;
      }
    });
    
    return tempDiv.innerHTML;
  } catch (error) {
    console.warn('⚠️ Error cleaning Word HTML:', error);
    return html;
  }
};

// Export to Word function
export const exportToWord = async (content: string, filename: string = 'document') => {
  try {
    console.log('🚀 Starting Word export process...');
    console.log('📄 Content length:', content.length);
    
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
                children: [new TextRun({ text: h1Text, bold: true, size: 32 })],
                spacing: { before: 400, after: 200 }
              }));
            }
            break;
            
          case 'h2':
            const h2Text = element.textContent?.trim() || '';
            if (h2Text) {
              results.push(new Paragraph({
                children: [new TextRun({ text: h2Text, bold: true, size: 28 })],
                spacing: { before: 300, after: 200 }
              }));
            }
            break;
            
          case 'h3':
            const h3Text = element.textContent?.trim() || '';
            if (h3Text) {
              results.push(new Paragraph({
                children: [new TextRun({ text: h3Text, bold: true, size: 24 })],
                spacing: { before: 200, after: 200 }
              }));
            }
            break;
            
          case 'p':
          case 'div':
            const textContent = element.textContent?.trim();
            if (textContent) {
              results.push(new Paragraph({
                children: [new TextRun({ text: textContent, size: 24 })],
                spacing: { before: 200, after: 200 }
              }));
            }
            break;
            
          case 'br':
              results.push(new Paragraph({
              children: [new TextRun('')],
              spacing: { before: 100 }
            }));
            break;
            
          case 'strong':
          case 'b':
            const boldText = element.textContent?.trim() || '';
            if (boldText) {
              results.push(new Paragraph({
                children: [new TextRun({ text: boldText, bold: true, size: 24 })],
                spacing: { before: 200, after: 200 }
              }));
            }
            break;
            
          case 'em':
          case 'i':
            const italicText = element.textContent?.trim() || '';
            if (italicText) {
              results.push(new Paragraph({
                children: [new TextRun({ text: italicText, italics: true, size: 24 })],
                spacing: { before: 200, after: 200 }
              }));
            }
            break;
            
          case 'img':
            const imgElement = element as HTMLImageElement;
            const altText = imgElement.alt || 'Image';
            results.push(new Paragraph({
              children: [new TextRun({ text: `[Image: ${altText}]`, size: 20 })],
              spacing: { before: 200, after: 200 }
            }));
            break;
            
          case 'table':
            const tableText = element.textContent?.trim();
            if (tableText) {
              results.push(new Paragraph({
                children: [new TextRun({ text: `Table: ${tableText}`, size: 20 })],
                spacing: { before: 200, after: 200 }
              }));
            }
            break;
            
          default:
            // For any other elements, just get the text content
            const defaultText = element.textContent?.trim();
            if (defaultText) {
              results.push(new Paragraph({
                children: [new TextRun({ text: defaultText, size: 24 })],
                spacing: { before: 200, after: 200 }
              }));
            }
            break;
        }
      }
      
      return results;
    };
    
    // Process all child nodes
    for (const child of tempDiv.childNodes) {
      const childResults = processNode(child);
      children.push(...childResults);
    }
    
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    // Generate and download file
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Word document exported successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error exporting to Word:', error);
    return false;
  }
};

// Export to PDF function
export const exportToPDF = async (content: string, filename: string = 'document') => {
  try {
    console.log('🚀 Starting PDF export process...');
    
    // Create a simple text-based PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (2 * margin);
    
    // Set font
    pdf.setFont('Arial', 'normal');
    pdf.setFontSize(12);
    
    // Split content into lines
    const lines = pdf.splitTextToSize(content.replace(/<[^>]*>/g, ''), maxWidth);
    
    let y = margin;
    const lineHeight = 7;
    
    for (const line of lines) {
      if (y > pageHeight - margin) {
      pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    }
    
    pdf.save(`${filename}.pdf`);
    console.log('✅ PDF exported successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error exporting to PDF:', error);
    return false;
  }
};
