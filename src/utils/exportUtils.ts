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
  
  // Process all elements in their original order
  const allElements = Array.from(tempDiv.childNodes);
  console.log(`📋 Processing ${allElements.length} total elements`);
  
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    console.log(`📝 Processing element ${i + 1}:`, element.nodeType, element.nodeName);
    
    if (element.nodeType === Node.TEXT_NODE) {
      // Handle text nodes
      const text = element.textContent?.trim();
      if (text) {
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText(text, padding, yOffset + lineHeight);
        yOffset += lineHeight;
        console.log(`✅ Text drawn: "${text}"`);
      }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      const htmlElement = element as HTMLElement;
      const tagName = htmlElement.tagName.toLowerCase();
      
      if (tagName === 'img') {
        // Handle images
        const img = htmlElement as HTMLImageElement;
        console.log(`🖼️ Processing image:`, img.src);
        console.log(`📏 Image dimensions:`, {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: img.width,
          height: img.height,
          style: {
            width: img.style.width,
            height: img.style.height,
            display: img.style.display,
            margin: img.style.margin
          }
        });
        
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
                
                console.log(`📐 Final calculated display dimensions:`, {
                  width: displayWidth,
                  height: displayHeight,
                  yOffset: yOffset,
                  originalWidth: img.width,
                  originalHeight: img.height,
                  scaleFactor: scaleFactor
                });
                
                // Draw image at exact position and size
                ctx.drawImage(newImg, padding, yOffset, displayWidth, displayHeight);
                console.log(`✅ Image drawn successfully at ${displayWidth}x${displayHeight}`);
                
                yOffset += displayHeight + 20; // Add spacing after image
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
          ctx.fillRect(padding, yOffset, 200, 150);
          ctx.fillStyle = '#666';
          ctx.fillText('Image failed to load', padding + 10, yOffset + 80);
          yOffset += 170;
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
          
          let xPosition = padding;
          if (textAlign === 'center') {
            xPosition = rect.width / 2;
          } else if (textAlign === 'right') {
            xPosition = rect.width - padding;
          }
          
          ctx.fillText(text, xPosition, yOffset + lineHeight);
          yOffset += lineHeight;
          console.log(`✅ Text element drawn: "${text}" with ${fontSize}px font`);
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
    console.log('📋 Added temp div to document body');
    
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
    let canvas: HTMLCanvasElement;
    
    try {
      canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: true,
        imageTimeout: 15000,
        width: tempDiv.offsetWidth,
        height: tempDiv.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure proper styling in cloned document
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img, index) => {
            const originalImg = images[index] as HTMLImageElement;
            console.log(`🔄 Cloning image ${index + 1}:`, {
              original: {
                width: originalImg.width,
                height: originalImg.height,
                styleWidth: originalImg.style.width,
                styleHeight: originalImg.style.height
              }
            });
            
            // Preserve exact dimensions from original
            if (originalImg.style.width) {
              (img as HTMLElement).style.width = originalImg.style.width;
            }
            if (originalImg.style.height) {
              (img as HTMLElement).style.height = originalImg.style.height;
            }
            
            // Set computed dimensions
            if (originalImg.width) {
              (img as HTMLElement).style.width = `${originalImg.width}px`;
            }
            if (originalImg.height) {
              (img as HTMLElement).style.height = `${originalImg.height}px`;
            }
            
            // Ensure other styling
            (img as HTMLElement).style.maxWidth = '100%';
            (img as HTMLElement).style.height = 'auto';
            (img as HTMLElement).style.objectFit = 'contain';
            (img as HTMLElement).style.display = 'block';
            (img as HTMLElement).style.margin = '10px 0';
            
            console.log(`✅ Cloned image ${index + 1} with dimensions:`, {
              width: (img as HTMLElement).style.width,
              height: (img as HTMLElement).style.height
            });
          });
          
          const clonedTables = clonedDoc.querySelectorAll('table');
          clonedTables.forEach(table => {
            (table as HTMLElement).style.border = '1px solid #000';
          });
        }
      });
      console.log('✅ html2canvas completed successfully');
    } catch (html2canvasError) {
      console.error('❌ html2canvas failed:', html2canvasError);
      console.log('🔄 Trying manual canvas drawing as fallback...');
      
      try {
        canvas = await drawImagesToCanvas(tempDiv);
        console.log('✅ Manual canvas drawing completed successfully');
      } catch (manualError) {
        console.error('❌ Manual canvas drawing also failed:', manualError);
        throw new Error('Both html2canvas and manual drawing failed');
      }
    }
    
    console.log('Canvas created successfully');
    document.body.removeChild(tempDiv);
    
    // Try manual canvas drawing as fallback if html2canvas fails
    let finalCanvas = canvas;
    let useManualCanvas = false;
    
    // Check if canvas has content
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context for fallback check');
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some(pixel => pixel !== 0);
    
    if (!hasContent || canvas.width === 0 || canvas.height === 0) {
      console.log('⚠️ html2canvas produced empty canvas, trying manual drawing...');
      try {
        // Recreate temp div for manual drawing
        const manualTempDiv = document.createElement('div');
        manualTempDiv.innerHTML = content;
        manualTempDiv.style.cssText = `
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
        
        document.body.appendChild(manualTempDiv);
        finalCanvas = await drawImagesToCanvas(manualTempDiv);
        document.body.removeChild(manualTempDiv);
        useManualCanvas = true;
        console.log('✅ Manual canvas drawing successful');
      } catch (manualError) {
        console.error('❌ Manual canvas drawing also failed:', manualError);
        // Continue with original canvas
      }
    }
    
    // Create PDF with high quality
    console.log('Creating PDF...');
    const imgData = finalCanvas.toDataURL('image/png', 1.0);
    console.log('✅ Canvas converted to data URL');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    console.log('✅ PDF object created');
    
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15;
    const imgWidth = pageWidth - (2 * margin);
    const imgHeight = (finalCanvas.height * imgWidth) / finalCanvas.width;
    
    console.log('📐 PDF dimensions:', {
      pageWidth,
      pageHeight,
      imgWidth,
      imgHeight,
      canvasWidth: finalCanvas.width,
      canvasHeight: finalCanvas.height
    });
    
    let yPosition = margin;
    let remainingHeight = imgHeight;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    console.log('✅ First page added to PDF');
    remainingHeight -= (pageHeight - 2 * margin);
    
    // Add additional pages if content overflows
    let pageCount = 1;
    while (remainingHeight > 0) {
      pdf.addPage();
      pageCount++;
      yPosition = margin - (imgHeight - remainingHeight);
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      remainingHeight -= (pageHeight - 2 * margin);
      console.log(`✅ Page ${pageCount} added to PDF`);
    }
    
    // Download the PDF
    console.log('Saving PDF...');
    pdf.save(`${filename}.pdf`);
    console.log(`PDF export completed successfully using ${useManualCanvas ? 'manual canvas' : 'html2canvas'} with ${pageCount} pages`);
    
    return true;
  } catch (error) {
    console.error('❌ Error exporting to PDF:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to show error to user
  }
};