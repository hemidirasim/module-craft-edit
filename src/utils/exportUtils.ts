import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';

// Initialize Supabase client
const supabaseUrl = 'https://qgmluixnzhpthywyrytn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGx1aXhuemhwdGh5d3lydG4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDI5NzE5NywiZXhwIjoyMDUwODczMTk3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Import from Word function using mammoth.js
export const importFromWord = async (file: File): Promise<string> => {
  try {
    console.log('📄 Starting Word import process with mammoth.js...');
    console.log('📄 File name:', file.name);
    console.log('📄 File size:', file.size, 'bytes');
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      throw new Error('Please select a .docx file');
    }
    
    // Use mammoth.js to convert Word to HTML with enhanced options
    const arrayBuffer = await file.arrayBuffer();
const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
          "p[style-name='Quote'] => blockquote:fresh",
          "p[style-name='Intense Quote'] => blockquote:fresh",
          "p[style-name='List Paragraph'] => li:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em",
          "r[style-name='Code'] => code",
          "r[style-name='Strikethrough'] => s",
          "r[style-name='Underline'] => u"
        ],
        ignoreEmptyParagraphs: false
      }
    );
    
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
    
    // Clean up the HTML content
    const cleanedHtml = cleanWordHtml(result.value);
    
    console.log('✅ Word import completed successfully');
    console.log('📄 Final HTML length:', cleanedHtml.length);
    
    return cleanedHtml;
  } catch (error) {
    console.error('❌ Error importing from Word:', error);
    throw new Error(`Failed to import Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      // Convert Word background colors
      style = style.replace(/background-color:\s*#([0-9A-Fa-f]{6})/g, (match, color) => {
        const r = color.substring(4, 6);
        const g = color.substring(2, 4);
        const b = color.substring(0, 2);
        return `background-color: #${r}${g}${b}`;
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
      
      // Convert font sizes from pt to px (1pt ≈ 1.33px)
      style = style.replace(/font-size:\s*(\d+)pt/g, (match, size) => {
        const pxSize = Math.round(parseInt(size) * 1.33);
        return `font-size: ${pxSize}px`;
      });
      
      // Remove only problematic Word-specific styles, keep useful ones
      style = style.replace(/mso-[^;]+;?/g, ''); // Remove mso-* styles
      style = style.replace(/line-height:\s*normal;?/g, ''); // Remove normal line-height
      style = style.replace(/margin:\s*0cm;?/g, ''); // Remove 0cm margins
      style = style.replace(/text-indent:\s*0cm;?/g, ''); // Remove text-indent
      
      // Clean up multiple semicolons and spaces
      style = style.replace(/;+/g, ';').replace(/;\s*;/g, ';').trim();
      if (style.endsWith(';')) {
        style = style.slice(0, -1);
      }
      
      if (style) {
        element.setAttribute('style', style);
      } else {
        element.removeAttribute('style');
      }
    });
    
    // Convert Word headings to proper HTML headings while preserving formatting
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      const element = p as HTMLElement;
      const style = element.getAttribute('style') || '';
      const text = element.textContent?.trim() || '';
      
      // Check if it's a heading based on style, font size, or content
      const isBold = style.includes('font-weight: bold') || style.includes('font-weight:bold');
      const hasLargeFont = style.includes('font-size:') && (style.includes('font-size: 18px') || style.includes('font-size: 20px') || style.includes('font-size: 22px') || style.includes('font-size: 24px'));
      const isShortText = text.length < 100;
      
      if ((isBold || hasLargeFont) && isShortText) {
        // Determine heading level based on font size or text length
        let headingLevel = 2; // Default to h2
        
        if (style.includes('font-size: 24px') || text.length < 30) {
          headingLevel = 1;
        } else if (style.includes('font-size: 22px') || text.length < 50) {
          headingLevel = 2;
        } else if (style.includes('font-size: 20px') || text.length < 70) {
          headingLevel = 3;
        } else if (style.includes('font-size: 18px')) {
          headingLevel = 4;
        }
        
        const heading = document.createElement(`h${headingLevel}`);
        heading.innerHTML = element.innerHTML;
        
        // Preserve the original styling
        if (style) {
          heading.setAttribute('style', style);
        }
        
        element.parentNode?.replaceChild(heading, element);
      }
    });
    
    // Process lists and preserve formatting
    const listItems = tempDiv.querySelectorAll('li');
    listItems.forEach(li => {
      const element = li as HTMLElement;
      const style = element.getAttribute('style') || '';
      
      // Preserve list item formatting
      if (style) {
        element.setAttribute('style', style);
      }
    });
    
    // Process tables and preserve formatting
    const tables = tempDiv.querySelectorAll('table');
    tables.forEach(table => {
      const element = table as HTMLElement;
      const style = element.getAttribute('style') || '';
      
      // Add default table styling if none exists
      if (!style.includes('border-collapse')) {
        element.setAttribute('style', style + '; border-collapse: collapse; width: 100%; margin: 10px 0;');
      }
    });
    
    // Process table cells and preserve formatting
    const cells = tempDiv.querySelectorAll('td, th');
    cells.forEach(cell => {
      const element = cell as HTMLElement;
      const style = element.getAttribute('style') || '';
      
      // Add default cell styling if none exists
      if (!style.includes('border')) {
        element.setAttribute('style', style + '; border: 1px solid #ddd; padding: 8px;');
      }
    });
    
    // Clean up empty elements
    const emptyElements = tempDiv.querySelectorAll('p:empty, div:empty, span:empty');
    emptyElements.forEach(el => el.remove());
    
    // Get the cleaned HTML
    let cleanedHtml = tempDiv.innerHTML;
    
    // Remove only Word-specific tags that don't affect content
    cleanedHtml = cleanedHtml
      .replace(/<o:p[^>]*>.*?<\/o:p>/g, '') // Remove o:p tags
      .replace(/<w:sdt[^>]*>.*?<\/w:sdt>/g, '') // Remove w:sdt tags
      .replace(/<w:sdtContent[^>]*>.*?<\/w:sdtContent>/g, '') // Remove w:sdtContent tags
      .replace(/<w:sdtPr[^>]*>.*?<\/w:sdtPr>/g, '') // Remove w:sdtPr tags
      .replace(/<w:sdtEndPr[^>]*>.*?<\/w:sdtEndPr>/g, '') // Remove w:sdtEndPr tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('✅ HTML cleaning completed with preserved colors and formatting');
    return cleanedHtml;
  } catch (error) {
    console.warn('⚠️ Error cleaning HTML, returning original:', error);
    return html;
  }
};

// Test function to debug Word import
export const testWordImport = async (file: File): Promise<any> => {
  try {
    console.log('🧪 Testing Word import with mammoth.js...');
    console.log('📄 File name:', file.name);
    console.log('📄 File size:', file.size, 'bytes');
    
    const arrayBuffer = await file.arrayBuffer();
const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
          "p[style-name='Quote'] => blockquote:fresh",
          "p[style-name='Intense Quote'] => blockquote:fresh",
          "p[style-name='List Paragraph'] => li:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em",
          "r[style-name='Code'] => code",
          "r[style-name='Strikethrough'] => s",
          "r[style-name='Underline'] => u"
        ],
        ignoreEmptyParagraphs: false
      }
    );
    
    const testResult = {
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      mammothResult: {
        htmlLength: result.value.length,
        htmlPreview: result.value.substring(0, 500),
        messages: result.messages,
        messageCount: result.messages.length
      },
      cleanedHtml: null as string | null
    };
    
    // Try to clean the HTML
    try {
      testResult.cleanedHtml = cleanWordHtml(result.value);
    } catch (error) {
      console.error('❌ HTML cleaning failed:', error);
      testResult.cleanedHtml = 'Cleaning failed: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('🧪 Test results:', testResult);
    return testResult;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
  }
};

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
  console.log('🖼️ Starting image conversion for:', imageUrl);
  
  try {
    // Check if it's a Supabase signed URL
    if (imageUrl.includes('supabase.co') && imageUrl.includes('token=')) {
      console.log('🔗 Detected Supabase signed URL');
      
      // For Supabase signed URLs, try direct fetch first
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 Supabase fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Supabase image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📦 Supabase blob size:', blob.size, 'bytes');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('✅ Supabase image converted to base64 successfully');
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
          console.error('❌ Supabase FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    }
    
    console.log('🌐 Processing regular URL');
    
    // For other URLs, try direct fetch
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('📡 Regular fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('📦 Regular blob size:', blob.size, 'bytes');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('✅ Regular image converted to base64 successfully');
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error('❌ Regular FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('⚠️ Direct fetch failed, trying proxy:', error);
    
    try {
      // Second try: Use a CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${imageUrl}`;
      console.log('🔄 Trying proxy URL:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 Proxy fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Proxy fetch failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📦 Proxy blob size:', blob.size, 'bytes');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('✅ Proxy image converted to base64 successfully');
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
          console.error('❌ Proxy FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (proxyError) {
      console.warn('❌ Proxy fetch also failed:', proxyError);
      throw proxyError;
    }
  }
};

// Helper function to manually draw images to canvas with exact editor formatting
const drawImagesToCanvas = async (tempDiv: HTMLElement): Promise<HTMLCanvasElement> => {
  console.log('🎨 Starting manual image drawing to canvas with exact formatting');
  
  // Create a canvas with the same dimensions as the div
  const rect = tempDiv.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Set canvas size
  canvas.width = rect.width * 2; // Higher resolution
  canvas.height = rect.height * 2;
  ctx.scale(2, 2); // Scale for high DPI
  
  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Convert div content to canvas with exact positioning
  const images = tempDiv.querySelectorAll('img');
  const textElements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span');
  console.log(`🖼️ Found ${images.length} images and ${textElements.length} text elements`);
  
  let yOffset = 20; // Start with some padding
  const padding = 20;
  const lineHeight = 24;
  
  // Process all elements in their original order with exact positioning
  const allElements = Array.from(tempDiv.childNodes);
  console.log(`📋 Processing ${allElements.length} total elements`);
  
  // Track current line position for inline elements
  let currentLineY = yOffset;
  let currentLineX = padding;
  let maxLineHeight = lineHeight;
  
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    console.log(`📝 Processing element ${i + 1}:`, element.nodeType, element.nodeName);
    
    if (element.nodeType === Node.TEXT_NODE) {
      // Handle text nodes
      const text = element.textContent?.trim();
      if (text) {
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial, sans-serif';
        
        // Check if text should be inline or on new line
        const textWidth = ctx.measureText(text).width;
        const availableWidth = rect.width - (2 * padding);
        
        if (currentLineX + textWidth > availableWidth) {
          // Move to next line
          currentLineY += maxLineHeight;
          currentLineX = padding;
          maxLineHeight = lineHeight;
        }
        
        ctx.fillText(text, currentLineX, currentLineY + lineHeight);
        currentLineX += textWidth + 5; // Add small spacing
        maxLineHeight = Math.max(maxLineHeight, lineHeight);
        
        console.log(`✅ Text drawn: "${text}" at (${currentLineX}, ${currentLineY})`);
      }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      const htmlElement = element as HTMLElement;
      const tagName = htmlElement.tagName.toLowerCase();
      
      if (tagName === 'img') {
        // Handle images with exact positioning
        const img = htmlElement as HTMLImageElement;
        console.log(`🖼️ Processing image:`, img.src);
        
        // Get computed style for positioning
        const computedStyle = window.getComputedStyle(img);
        const display = computedStyle.display;
        const float = computedStyle.float;
        const position = computedStyle.position;
        
        console.log(`📍 Image positioning:`, {
          display,
          float,
          position,
          margin: computedStyle.margin,
          padding: computedStyle.padding
        });
        
        // Check if image should be inline or block
        const isInline = display === 'inline' || display === 'inline-block' || float === 'left' || float === 'right';
        
        try {
          // Create a new image element
          const newImg = new Image();
          newImg.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            newImg.onload = () => {
              try {
                // Get the actual displayed dimensions from the original image
                let displayWidth = img.width || img.naturalWidth;
                let displayHeight = img.height || img.naturalHeight;
                
                console.log(`🔍 Original image computed dimensions:`, {
                  width: img.width,
                  height: img.height,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                  offsetWidth: img.offsetWidth,
                  offsetHeight: img.offsetHeight,
                  clientWidth: img.clientWidth,
                  clientHeight: img.clientHeight,
                  styleWidth: img.style.width,
                  styleHeight: img.style.height,
                  computedStyle: window.getComputedStyle(img)
                });
                
                // Get computed style for more accurate dimensions
                const computedStyle = window.getComputedStyle(img);
                const computedWidth = computedStyle.width;
                const computedHeight = computedStyle.height;
                
                console.log(`📏 Computed styles:`, {
                  width: computedWidth,
                  height: computedHeight,
                  maxWidth: computedStyle.maxWidth,
                  maxHeight: computedStyle.maxHeight
                });
                
                // Get the actual displayed size from the editor
                const editorContainer = tempDiv.closest('.editor-container') || tempDiv.parentElement;
                const editorWidth = (editorContainer as HTMLElement)?.offsetWidth || 800;
                const scaleFactor = editorWidth / 800; // Normalize to standard editor width
                
                console.log(`📐 Editor scaling:`, {
                  editorWidth,
                  scaleFactor,
                  containerWidth: (editorContainer as HTMLElement)?.offsetWidth
                });
                
                // Parse computed dimensions first
                if (computedWidth && computedWidth !== 'auto') {
                  if (computedWidth.includes('px')) {
                    displayWidth = parseFloat(computedWidth);
                  } else if (computedWidth.includes('%')) {
                    const percentage = parseFloat(computedWidth) / 100;
                    displayWidth = (rect.width - (2 * padding)) * percentage;
                  }
                }
                
                if (computedHeight && computedHeight !== 'auto') {
                  if (computedHeight.includes('px')) {
                    displayHeight = parseFloat(computedHeight);
                  } else if (computedHeight.includes('%')) {
                    const percentage = parseFloat(computedHeight) / 100;
                    displayHeight = 300 * percentage;
                  }
                }
                
                // Fallback to style dimensions if computed is not available
                if (img.style.width && (!computedWidth || computedWidth === 'auto')) {
                  const widthValue = img.style.width;
                  if (widthValue.includes('px')) {
                    displayWidth = parseInt(widthValue);
                  } else if (widthValue.includes('%')) {
                    const percentage = parseInt(widthValue) / 100;
                    displayWidth = (rect.width - (2 * padding)) * percentage;
                  }
                }
                
                if (img.style.height && img.style.height !== 'auto' && (!computedHeight || computedHeight === 'auto')) {
                  const heightValue = img.style.height;
                  if (heightValue.includes('px')) {
                    displayHeight = parseInt(heightValue);
                  } else if (heightValue.includes('%')) {
                    const percentage = parseInt(heightValue) / 100;
                    displayHeight = 300 * percentage;
                  }
                }
                
                // Use offset dimensions as final fallback
                if (displayWidth === img.naturalWidth && img.offsetWidth > 0) {
                  displayWidth = img.offsetWidth;
                }
                if (displayHeight === img.naturalHeight && img.offsetHeight > 0) {
                  displayHeight = img.offsetHeight;
                }
                
                // Apply scaling factor to match editor display
                displayWidth = displayWidth * scaleFactor;
                displayHeight = displayHeight * scaleFactor;
                
                console.log(`📏 After scaling:`, {
                  width: displayWidth,
                  height: displayHeight,
                  scaleFactor
                });
                
                // Maintain aspect ratio if only width is specified
                if ((img.style.width || computedWidth !== 'auto') && (!img.style.height || img.style.height === 'auto') && computedHeight === 'auto') {
                  const aspectRatio = newImg.naturalHeight / newImg.naturalWidth;
                  displayHeight = displayWidth * aspectRatio;
                  console.log(`🔄 Maintaining aspect ratio: ${displayWidth} x ${displayHeight}`);
                }
                
                // Ensure minimum and maximum dimensions
                const maxWidth = rect.width - (2 * padding);
                const maxHeight = 400;
                
                if (displayWidth > maxWidth) {
                  const ratio = maxWidth / displayWidth;
                  displayWidth = maxWidth;
                  displayHeight = displayHeight * ratio;
                  console.log(`📐 Scaled down to max width: ${displayWidth} x ${displayHeight}`);
                }
                
                if (displayHeight > maxHeight) {
                  const ratio = maxHeight / displayHeight;
                  displayHeight = maxHeight;
                  displayWidth = displayWidth * ratio;
                  console.log(`📐 Scaled down to max height: ${displayWidth} x ${displayHeight}`);
                }
                
                // Calculate position based on display type
                let imageX = padding;
                let imageY = currentLineY;
                
                if (isInline) {
                  // Check if image fits on current line
                  const availableWidth = rect.width - (2 * padding);
                  if (currentLineX + displayWidth > availableWidth) {
                    // Move to next line
                    currentLineY += maxLineHeight;
                    currentLineX = padding;
                    maxLineHeight = lineHeight;
                    imageY = currentLineY;
                  }
                  imageX = currentLineX;
                  currentLineX += displayWidth + 10; // Add spacing after image
                } else {
                  // Block element - start new line
                  currentLineY += maxLineHeight;
                  currentLineX = padding;
                  maxLineHeight = lineHeight;
                  imageY = currentLineY;
                }
                
                maxLineHeight = Math.max(maxLineHeight, displayHeight);
                
                console.log(`📐 Final calculated display dimensions:`, {
                  width: displayWidth,
                  height: displayHeight,
                  x: imageX,
                  y: imageY,
                  isInline,
                  originalWidth: img.width,
                  originalHeight: img.height,
                  scaleFactor: scaleFactor
                });
                
                // Draw image at exact position and size
                ctx.drawImage(newImg, imageX, imageY, displayWidth, displayHeight);
                console.log(`✅ Image drawn successfully at ${displayWidth}x${displayHeight} at (${imageX}, ${imageY})`);
                
                resolve();
              } catch (drawError) {
                console.error(`❌ Error drawing image:`, drawError);
                reject(drawError);
              }
            };
            
            newImg.onerror = (error) => {
              console.error(`❌ Error loading image:`, error);
              reject(new Error(`Failed to load image`));
            };
            
            newImg.src = img.src;
          });
        } catch (error) {
          console.warn(`⚠️ Skipping image due to error:`, error);
          // Draw placeholder
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(currentLineX, currentLineY, 200, 150);
          ctx.fillStyle = '#666';
          ctx.fillText('Image failed to load', currentLineX + 10, currentLineY + 80);
          currentLineX += 210;
        }
      } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'].includes(tagName)) {
        // Handle text elements
        const text = htmlElement.textContent?.trim();
        if (text) {
          // Set font based on tag
          let fontSize = 14;
          let fontWeight = 'normal';
          
          if (tagName.startsWith('h')) {
            fontSize = 24 - (parseInt(tagName[1]) * 2); // h1=22, h2=20, etc.
            fontWeight = 'bold';
          }
          
          ctx.fillStyle = '#000000';
          ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
          
          // Handle text alignment
          const textAlign = htmlElement.style.textAlign || 'left';
          ctx.textAlign = textAlign as CanvasTextAlign;
          
          // Check if element should start new line
          const isBlock = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(tagName);
          if (isBlock) {
            currentLineY += maxLineHeight;
            currentLineX = padding;
            maxLineHeight = lineHeight;
          }
          
          let xPosition = currentLineX;
          if (textAlign === 'center') {
            xPosition = rect.width / 2;
          } else if (textAlign === 'right') {
            xPosition = rect.width - padding;
          }
          
          ctx.fillText(text, xPosition, currentLineY + lineHeight);
          
          if (isBlock) {
            currentLineY += lineHeight;
            currentLineX = padding;
          } else {
            // Inline element
            const textWidth = ctx.measureText(text).width;
            currentLineX += textWidth + 5;
          }
          
          console.log(`✅ Text element drawn: "${text}" with ${fontSize}px font at (${xPosition}, ${currentLineY})`);
        }
      }
    }
  }
  
  console.log('✅ Manual canvas drawing completed with exact formatting');
  return canvas;
};

export const exportToPDF = async (content: string, filename: string = 'document') => {
  try {
    console.log('🚀 Starting PDF export process...');
    console.log('📄 Content length:', content.length);
    console.log('📄 Content preview:', content.substring(0, 200) + '...');
    
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
    
    console.log('📋 Created temporary div');
    
    // Convert all images to base64 to avoid CORS issues
    const images = tempDiv.querySelectorAll('img');
    console.log(`🖼️ Found ${images.length} images in content`);
    
    if (images.length === 0) {
      console.log('ℹ️ No images found, proceeding with text-only content');
    }
    
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, { scale: 2 }); // Scale for high DPI
    console.log('✅ HTML converted to canvas');
    
    // Convert canvas to PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    let heightLeft = canvas.height;
    let position = 0;
    
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, canvas.height / canvas.width * imgWidth);
    
    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - pageHeight;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, canvas.height / canvas.width * imgWidth);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`${filename}.pdf`);
    console.log('✅ PDF exported successfully');
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
