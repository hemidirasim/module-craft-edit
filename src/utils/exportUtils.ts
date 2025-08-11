import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qgmluixnzhpthywyrytn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lydG4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDI5NzE5NywiZXhwIjoyMDUwODczMTk3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Import from Word function
export const importFromWord = async (file: File): Promise<string> => {
  try {
    console.log('📄 Starting Word import process...');
    console.log('📄 File name:', file.name);
    console.log('📄 File size:', file.size, 'bytes');
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      throw new Error('Please select a .docx file');
    }
    
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ File read as ArrayBuffer');
    
    // Extract content using improved method
    const htmlContent = await extractWordContent(arrayBuffer);
    
    // Validate extracted content
    if (!htmlContent || htmlContent.trim().length === 0) {
      console.warn('⚠️ Extracted content is empty, using fallback');
      return '<p>No content could be extracted from the Word document. Please check if the file contains text content.</p>';
    }
    
    console.log('✅ Word import completed successfully');
    console.log('📄 Extracted HTML length:', htmlContent.length);
    console.log('📄 HTML preview:', htmlContent.substring(0, 200) + '...');
    
    return htmlContent;
  } catch (error) {
    console.error('❌ Error importing from Word:', error);
    throw new Error(`Failed to import Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Simple and effective Word content extraction
const extractWordContent = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try different encodings
    let xmlContent = '';
    const encodings = ['utf-8', 'utf-16', 'utf-16le', 'utf-16be', 'windows-1252', 'iso-8859-1'];
    
    for (const encoding of encodings) {
      try {
        const textDecoder = new TextDecoder(encoding);
        xmlContent = textDecoder.decode(uint8Array);
        
        // Check if we got readable content
        if (xmlContent.includes('<?xml') || xmlContent.includes('<w:document')) {
          console.log('✅ Successfully decoded with encoding:', encoding);
          break;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to decode with ${encoding}:`, error);
      }
    }
    
    if (!xmlContent || xmlContent.length === 0) {
      console.warn('⚠️ Could not decode content with any encoding');
      return await extractSimpleWordContent(arrayBuffer);
    }
    
    console.log('📄 XML content length:', xmlContent.length);
    console.log('📄 XML preview:', xmlContent.substring(0, 500) + '...');
    
    // Extract document.xml content (main content)
    const documentMatch = xmlContent.match(/<w:document[^>]*>.*?<\/w:document>/s);
    if (!documentMatch) {
      console.warn('⚠️ Could not find document content, trying alternative method');
      return await extractSimpleWordContent(arrayBuffer);
    }
    
    const documentXml = documentMatch[0];
    console.log('📄 Document XML extracted, length:', documentXml.length);
    
    // Parse body content
    const bodyMatch = documentXml.match(/<w:body[^>]*>(.*?)<\/w:body>/s);
    if (!bodyMatch) {
      console.warn('⚠️ Could not find body content, trying alternative method');
      return await extractSimpleWordContent(arrayBuffer);
    }
    
    const bodyXml = bodyMatch[1];
    console.log('📄 Body XML extracted, length:', bodyXml.length);
    console.log('📄 Body preview:', bodyXml.substring(0, 300) + '...');
    
    // Parse paragraphs and tables
    const elements = parseBodyContent(bodyXml);
    console.log('📄 Parsed elements:', elements.length);
    console.log('📄 Element types:', elements.map(el => el.type));
    
    // Convert to HTML
    const htmlContent = convertParagraphsToHtml(elements);
    
    // Check if we got meaningful content
    if (!htmlContent || htmlContent.trim().length < 50) {
      console.warn('⚠️ Generated HTML is too short, trying fallback');
      return await extractSimpleWordContent(arrayBuffer);
    }
    
    return htmlContent;
  } catch (error) {
    console.warn('⚠️ Error in extractWordContent:', error);
    // Fallback to simple extraction
    return await extractSimpleWordContent(arrayBuffer);
  }
};

// Parse body content to find all possible elements
const parseBodyContent = (bodyXml: string): any[] => {
  const elements: any[] = [];
  
  // Find all paragraph elements
  const paragraphMatches = bodyXml.match(/<w:p[^>]*>.*?<\/w:p>/gs);
  
  if (paragraphMatches) {
    console.log('📄 Found', paragraphMatches.length, 'paragraphs');
    
    paragraphMatches.forEach((paragraphXml, index) => {
      try {
        const paragraph = parseParagraphContent(paragraphXml);
        if (paragraph && paragraph.text.trim()) {
          elements.push(paragraph);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing paragraph ${index}:`, error);
      }
    });
  }
  
  // Find all table elements
  const tableMatches = bodyXml.match(/<w:tbl[^>]*>.*?<\/w:tbl>/gs);
  
  if (tableMatches) {
    console.log('📄 Found', tableMatches.length, 'tables');
    
    tableMatches.forEach((tableXml, index) => {
      try {
        const table = parseTableContent(tableXml);
        if (table && table.rows.length > 0) {
          elements.push(table);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing table ${index}:`, error);
      }
    });
  }
  
  // Find all drawing elements (images, shapes, icons)
  const drawingMatches = bodyXml.match(/<w:drawing[^>]*>.*?<\/w:drawing>/gs);
  
  if (drawingMatches) {
    console.log('📄 Found', drawingMatches.length, 'drawings');
    
    drawingMatches.forEach((drawingXml, index) => {
      try {
        const drawing = parseDrawingContent(drawingXml);
        if (drawing) {
          elements.push(drawing);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing drawing ${index}:`, error);
      }
    });
  }
  
  // Find all object elements (embedded objects, symbols)
  const objectMatches = bodyXml.match(/<w:object[^>]*>.*?<\/w:object>/gs);
  
  if (objectMatches) {
    console.log('📄 Found', objectMatches.length, 'objects');
    
    objectMatches.forEach((objectXml, index) => {
      try {
        const object = parseObjectContent(objectXml);
        if (object) {
          elements.push(object);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing object ${index}:`, error);
      }
    });
  }
  
  return elements;
};

// Parse individual paragraph content
const parseParagraphContent = (paragraphXml: string): any => {
  const paragraph: any = { 
    type: 'paragraph', 
    text: '', 
    formatting: {}, 
    alignment: 'left', 
    listType: null, 
    listLevel: 0 
  };
  
  // Parse paragraph properties
  const pPrMatch = paragraphXml.match(/<w:pPr[^>]*>(.*?)<\/w:pPr>/s);
  if (pPrMatch) {
    const pPrXml = pPrMatch[1];
    
    // Check for heading style
    const styleMatch = pPrXml.match(/<w:pStyle[^>]*w:val="([^"]*)"/);
    if (styleMatch) {
      const styleValue = styleMatch[1];
      if (styleValue.includes('Heading') || styleValue.includes('heading')) {
        const levelMatch = styleValue.match(/(\d+)/);
        paragraph.type = 'heading';
        paragraph.level = levelMatch ? parseInt(levelMatch[1]) : 1;
      }
    }
    
    // Check for alignment
    const alignMatch = pPrXml.match(/<w:jc[^>]*w:val="([^"]*)"/);
    if (alignMatch) {
      paragraph.alignment = alignMatch[1];
    }
    
    // Check for list properties
    const numPrMatch = pPrXml.match(/<w:numPr[^>]*>(.*?)<\/w:numPr>/s);
    if (numPrMatch) {
      const numPrXml = numPrMatch[1];
      const numIdMatch = numPrXml.match(/<w:numId[^>]*w:val="([^"]*)"/);
      const ilvlMatch = numPrXml.match(/<w:ilvl[^>]*w:val="([^"]*)"/);
      
      if (numIdMatch) {
        paragraph.listType = 'numbered';
        paragraph.listLevel = ilvlMatch ? parseInt(ilvlMatch[1]) : 0;
      }
    }
  }
  
  // Parse text runs
  const textRuns = parseTextRuns(paragraphXml);
  
  // Combine text runs
  let combinedText = '';
  const combinedFormatting: any = {};
  
  textRuns.forEach((run: any) => {
    combinedText += run.text;
    // Merge formatting
    Object.assign(combinedFormatting, run.formatting);
  });
  
  paragraph.text = combinedText;
  paragraph.formatting = combinedFormatting;
  
  return paragraph;
};

// Parse text runs within a paragraph
const parseTextRuns = (paragraphXml: string): any[] => {
  const textRuns: any[] = [];
  
  const runMatches = paragraphXml.match(/<w:r[^>]*>.*?<\/w:r>/gs);
  
  if (runMatches) {
    runMatches.forEach((runXml) => {
      try {
        const textRun = parseTextRunContent(runXml);
        if (textRun && textRun.text) {
          textRuns.push(textRun);
        }
      } catch (error) {
        console.warn('⚠️ Error parsing text run:', error);
      }
    });
  }
  
  return textRuns;
};

// Parse individual text run content
const parseTextRunContent = (runXml: string): any => {
  const textRun: any = { text: '', formatting: {} };
  
  // Extract text content
  const textMatch = runXml.match(/<w:t[^>]*>(.*?)<\/w:t>/s);
  if (textMatch) {
    textRun.text = textMatch[1] || '';
  }
  
  // Extract symbol content
  const symbolMatch = runXml.match(/<w:sym[^>]*w:char="([^"]*)"/);
  if (symbolMatch) {
    const charCode = symbolMatch[1];
    const symbol = String.fromCharCode(parseInt(charCode, 16));
    textRun.text = symbol;
    textRun.type = 'symbol';
  }
  
  // Extract tab content
  const tabMatch = runXml.match(/<w:tab\/>/);
  if (tabMatch) {
    textRun.text = '\t';
    textRun.type = 'tab';
  }
  
  // Extract line break content
  const brMatch = runXml.match(/<w:br\/>/);
  if (brMatch) {
    textRun.text = '\n';
    textRun.type = 'linebreak';
  }
  
  // Extract page break content
  const pageBreakMatch = runXml.match(/<w:br[^>]*w:type="page"[^>]*\/>/);
  if (pageBreakMatch) {
    textRun.text = '<hr style="page-break-after: always; border: none; margin: 20px 0;" />';
    textRun.type = 'pagebreak';
  }
  
  // Parse run properties
  const rPrMatch = runXml.match(/<w:rPr[^>]*>(.*?)<\/w:rPr>/s);
  if (rPrMatch) {
    const rPrXml = rPrMatch[1];
    
    // Check for bold
    if (rPrXml.includes('<w:b') || rPrXml.includes('<w:bCs')) {
      textRun.formatting.bold = true;
    }
    
    // Check for italic
    if (rPrXml.includes('<w:i') || rPrXml.includes('<w:iCs')) {
      textRun.formatting.italic = true;
    }
    
    // Check for underline
    if (rPrXml.includes('<w:u')) {
      textRun.formatting.underline = true;
    }
    
    // Check for strikethrough
    if (rPrXml.includes('<w:strike')) {
      textRun.formatting.strikethrough = true;
    }
    
    // Check for font size
    const szMatch = rPrXml.match(/<w:sz[^>]*w:val="([^"]*)"/);
    if (szMatch) {
      textRun.formatting.fontSize = szMatch[1];
    }
    
    // Check for font family
    const fontMatch = rPrXml.match(/<w:rFonts[^>]*w:ascii="([^"]*)"/);
    if (fontMatch) {
      textRun.formatting.fontFamily = fontMatch[1];
    }
    
    // Check for color
    const colorMatch = rPrXml.match(/<w:color[^>]*w:val="([^"]*)"/);
    if (colorMatch) {
      textRun.formatting.color = colorMatch[1];
    }
    
    // Check for highlight
    const highlightMatch = rPrXml.match(/<w:highlight[^>]*w:val="([^"]*)"/);
    if (highlightMatch) {
      textRun.formatting.highlight = highlightMatch[1];
    }
    
    // Check for subscript
    if (rPrXml.includes('<w:vertAlign[^>]*w:val="subscript"')) {
      textRun.formatting.subscript = true;
    }
    
    // Check for superscript
    if (rPrXml.includes('<w:vertAlign[^>]*w:val="superscript"')) {
      textRun.formatting.superscript = true;
    }
    
    // Check for small caps
    if (rPrXml.includes('<w:smallCaps')) {
      textRun.formatting.smallCaps = true;
    }
    
    // Check for all caps
    if (rPrXml.includes('<w:caps')) {
      textRun.formatting.allCaps = true;
    }
  }
  
  return textRun;
};

// Parse table content
const parseTableContent = (tableXml: string): any => {
  const table: any = { type: 'table', rows: [] };
  
  // Find all table rows
  const rowMatches = tableXml.match(/<w:tr[^>]*>.*?<\/w:tr>/gs);
  
  if (rowMatches) {
    console.log('📄 Found', rowMatches.length, 'table rows');
    
    rowMatches.forEach((rowXml, rowIndex) => {
      try {
        const row = parseTableRow(rowXml);
        if (row && row.cells.length > 0) {
          table.rows.push(row);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing table row ${rowIndex}:`, error);
      }
    });
  }
  
  return table;
};

// Parse table row
const parseTableRow = (rowXml: string): any => {
  const row: any = { type: 'row', cells: [] };
  
  // Find all table cells
  const cellMatches = rowXml.match(/<w:tc[^>]*>.*?<\/w:tc>/gs);
  
  if (cellMatches) {
    cellMatches.forEach((cellXml, cellIndex) => {
      try {
        const cell = parseTableCell(cellXml);
        if (cell) {
          row.cells.push(cell);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing table cell ${cellIndex}:`, error);
      }
    });
  }
  
  return row;
};

// Parse table cell
const parseTableCell = (cellXml: string): any => {
  const cell: any = { type: 'cell', content: [] };
  
  // Find paragraphs within the cell
  const paragraphMatches = cellXml.match(/<w:p[^>]*>.*?<\/w:p>/gs);
  
  if (paragraphMatches) {
    paragraphMatches.forEach((paragraphXml) => {
      try {
        const paragraph = parseParagraphContent(paragraphXml);
        if (paragraph && paragraph.text.trim()) {
          cell.content.push(paragraph);
        }
      } catch (error) {
        console.warn('⚠️ Error parsing cell paragraph:', error);
      }
    });
  }
  
  return cell;
};

// Parse drawing content (images, shapes, icons)
const parseDrawingContent = (drawingXml: string): any => {
  const drawing: any = { type: 'drawing', content: '' };
  
  // Try to extract image information
  const blipMatch = drawingXml.match(/<a:blip[^>]*r:embed="([^"]*)"/);
  if (blipMatch) {
    drawing.type = 'image';
    drawing.embedId = blipMatch[1];
    drawing.content = `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Image" style="max-width: 100%; height: auto;" />`;
  }
  
  // Try to extract shape information
  const shapeMatch = drawingXml.match(/<wps:spPr[^>]*>(.*?)<\/wps:spPr>/s);
  if (shapeMatch) {
    drawing.type = 'shape';
    drawing.content = `<div style="width: 100px; height: 100px; background-color: #f0f0f0; border: 1px solid #ccc; display: inline-block; margin: 5px;" title="Shape"></div>`;
  }
  
  // Try to extract icon information
  const iconMatch = drawingXml.match(/<wps:bodyPr[^>]*>(.*?)<\/wps:bodyPr>/s);
  if (iconMatch) {
    drawing.type = 'icon';
    drawing.content = `<span style="font-size: 24px; color: #666;" title="Icon">📋</span>`;
  }
  
  return drawing;
};

// Parse object content (embedded objects, symbols)
const parseObjectContent = (objectXml: string): any => {
  const object: any = { type: 'object', content: '' };
  
  // Try to extract symbol information
  const symbolMatch = objectXml.match(/<w:sym[^>]*w:char="([^"]*)"/);
  if (symbolMatch) {
    object.type = 'symbol';
    const charCode = symbolMatch[1];
    const symbol = String.fromCharCode(parseInt(charCode, 16));
    object.content = `<span style="font-size: 18px; color: #333;">${symbol}</span>`;
  }
  
  // Try to extract equation information
  const equationMatch = objectXml.match(/<m:oMath[^>]*>(.*?)<\/m:oMath>/s);
  if (equationMatch) {
    object.type = 'equation';
    object.content = `<div style="background-color: #f8f9fa; padding: 10px; border: 1px solid #dee2e6; border-radius: 4px; margin: 10px 0; font-family: 'Times New Roman', serif;" title="Equation">${equationMatch[1]}</div>`;
  }
  
  // Try to extract embedded object information
  const embedMatch = objectXml.match(/<o:OLEObject[^>]*>(.*?)<\/o:OLEObject>/s);
  if (embedMatch) {
    object.type = 'embedded';
    object.content = `<div style="background-color: #e9ecef; padding: 15px; border: 2px dashed #6c757d; border-radius: 6px; margin: 10px 0; text-align: center; color: #6c757d;" title="Embedded Object">
      <span style="font-size: 24px;">📎</span><br>
      <small>Embedded Object</small>
    </div>`;
  }
  
  return object;
};

// Extract heading level from style value
const extractHeadingLevel = (styleValue: string): number => {
  const levelMatch = styleValue.match(/\d+/);
  return levelMatch ? parseInt(levelMatch[0]) : 1;
};

// Apply text formatting
const applyTextFormatting = (text: string, formatting: any): string => {
  let formattedText = text;
  
  // Apply formatting in order (innermost to outermost)
  if (formatting.strikethrough) {
    formattedText = `<s>${formattedText}</s>`;
  }
  
  if (formatting.underline) {
    formattedText = `<u>${formattedText}</u>`;
  }
  
  if (formatting.italic) {
    formattedText = `<em>${formattedText}</em>`;
  }
  
  if (formatting.bold) {
    formattedText = `<strong>${formattedText}</strong>`;
  }
  
  // Apply subscript
  if (formatting.subscript) {
    formattedText = `<sub>${formattedText}</sub>`;
  }
  
  // Apply superscript
  if (formatting.superscript) {
    formattedText = `<sup>${formattedText}</sup>`;
  }
  
  // Apply small caps
  if (formatting.smallCaps) {
    formattedText = `<span style="font-variant: small-caps;">${formattedText}</span>`;
  }
  
  // Apply all caps
  if (formatting.allCaps) {
    formattedText = `<span style="text-transform: uppercase;">${formattedText}</span>`;
  }
  
  if (formatting.italic) {
    formattedText = `<em>${formattedText}</em>`;
  }
  
  if (formatting.bold) {
    formattedText = `<strong>${formattedText}</strong>`;
  }
  
  // Apply inline styles for font properties
  const styles: string[] = [];
  
  if (formatting.fontSize) {
    styles.push(`font-size: ${formatting.fontSize}pt`);
  }
  
  if (formatting.fontFamily) {
    styles.push(`font-family: "${formatting.fontFamily}", Arial, sans-serif`);
  }
  
  if (formatting.color) {
    // Convert Word color to hex if needed
    const color = formatting.color;
    if (color.startsWith('FF')) {
      styles.push(`color: #${color.substring(2)}`);
    } else {
      styles.push(`color: #${color}`);
    }
  }
  
  if (formatting.highlight) {
    // Convert highlight color to background color
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
    
    const bgColor = highlightColors[formatting.highlight] || '#FFFF00';
    styles.push(`background-color: ${bgColor}`);
  }
  
  // Apply all styles if any exist
  if (styles.length > 0) {
    const styleAttr = ` style="${styles.join('; ')}"`;
    formattedText = `<span${styleAttr}>${formattedText}</span>`;
  }
  
  return formattedText;
};

// Convert paragraphs to HTML
const convertParagraphsToHtml = (elements: any[]): string => {
  const htmlParts: string[] = [];
  let currentListType = null;
  let currentListLevel = 0;
  let listItems: string[] = [];
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    // Handle tables
    if (element.type === 'table') {
      // Close any open list before table
      if (listItems.length > 0) {
        htmlParts.push(closeList(currentListType, listItems));
        listItems = [];
        currentListType = null;
        currentListLevel = 0;
      }
      
      // Convert table to HTML
      const tableHtml = convertTableToHtml(element);
      htmlParts.push(tableHtml);
      continue;
    }
    
    // Handle drawings (images, shapes, icons)
    if (element.type === 'drawing' || element.type === 'image' || element.type === 'shape' || element.type === 'icon') {
      // Close any open list before drawing
      if (listItems.length > 0) {
        htmlParts.push(closeList(currentListType, listItems));
        listItems = [];
        currentListType = null;
        currentListLevel = 0;
      }
      
      htmlParts.push(element.content);
      continue;
    }
    
    // Handle objects (symbols, equations, embedded objects)
    if (element.type === 'object' || element.type === 'symbol' || element.type === 'equation' || element.type === 'embedded') {
      // Close any open list before object
      if (listItems.length > 0) {
        htmlParts.push(closeList(currentListType, listItems));
        listItems = [];
        currentListType = null;
        currentListLevel = 0;
      }
      
      htmlParts.push(element.content);
      continue;
    }
    
    let content = element.formattedText || element.text;
    
    // Handle lists
    if (element.listType) {
      // Start new list or continue existing list
      if (currentListType !== element.listType || currentListLevel !== element.listLevel) {
        // Close previous list if exists
        if (listItems.length > 0) {
          htmlParts.push(closeList(currentListType, listItems));
          listItems = [];
        }
        
        // Start new list
        currentListType = element.listType;
        currentListLevel = element.listLevel;
      }
      
      // Add item to current list
      listItems.push(content);
    } else {
      // Close any open list
      if (listItems.length > 0) {
        htmlParts.push(closeList(currentListType, listItems));
        listItems = [];
        currentListType = null;
        currentListLevel = 0;
      }
      
      // Handle regular paragraph or heading
      if (element.type === 'heading') {
        const level = Math.min(element.level || 1, 6);
        const tag = `h${level}`;
        
        if (element.alignment && element.alignment !== 'left') {
          const alignStyle = ` style="text-align: ${element.alignment};"`;
          htmlParts.push(`<${tag}${alignStyle}>${content}</${tag}>`);
        } else {
          htmlParts.push(`<${tag}>${content}</${tag}>`);
        }
      } else {
        // Regular paragraph
        if (element.alignment && element.alignment !== 'left') {
          const alignStyle = ` style="text-align: ${element.alignment};"`;
          htmlParts.push(`<p${alignStyle}>${content}</p>`);
        } else {
          htmlParts.push(`<p>${content}</p>`);
        }
      }
    }
  }
  
  // Close any remaining list
  if (listItems.length > 0) {
    htmlParts.push(closeList(currentListType, listItems));
  }
  
  return htmlParts.join('\n');
};

// Helper function to close a list
const closeList = (listType: string | null, items: string[]): string => {
  if (!listType || items.length === 0) {
    return '';
  }
  
  const tag = listType === 'numbered' ? 'ol' : 'ul';
  const listItems = items.map(item => `<li>${item}</li>`).join('\n');
  
  return `<${tag}>\n${listItems}\n</${tag}>`;
};

// Convert table to HTML
const convertTableToHtml = (table: any): string => {
  if (!table.rows || table.rows.length === 0) {
    return '';
  }
  
  const tableRows: string[] = [];
  
  table.rows.forEach((row: any) => {
    if (!row.cells || row.cells.length === 0) {
      return;
    }
    
    const tableCells: string[] = [];
    
    row.cells.forEach((cell: any) => {
      let cellContent = '';
      
      if (cell.content && cell.content.length > 0) {
        // Convert cell content (paragraphs) to HTML
        const cellParagraphs: string[] = [];
        
        cell.content.forEach((paragraph: any) => {
          let content = paragraph.formattedText || paragraph.text;
          
          // Apply formatting if available
          if (paragraph.formatting && Object.keys(paragraph.formatting).length > 0) {
            content = applyTextFormatting(content, paragraph.formatting);
          }
          
          cellParagraphs.push(content);
        });
        
        cellContent = cellParagraphs.join('<br>');
      }
      
      tableCells.push(`<td>${cellContent}</td>`);
    });
    
    tableRows.push(`<tr>${tableCells.join('')}</tr>`);
  });
  
  return `<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
    <tbody>
      ${tableRows.join('\n')}
    </tbody>
  </table>`;
};

// Simple fallback extraction
const extractSimpleWordContent = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try different encodings for fallback
    let xmlContent = '';
    const encodings = ['utf-8', 'utf-16', 'utf-16le', 'utf-16be', 'windows-1252', 'iso-8859-1'];
    
    for (const encoding of encodings) {
      try {
        const textDecoder = new TextDecoder(encoding);
        xmlContent = textDecoder.decode(uint8Array);
        
        // Check if we got readable content
        if (xmlContent.includes('<w:t') || xmlContent.includes('<?xml')) {
          console.log('✅ Fallback decoded with encoding:', encoding);
          break;
        }
      } catch (error) {
        console.warn(`⚠️ Fallback failed to decode with ${encoding}:`, error);
      }
    }
    
    if (!xmlContent || xmlContent.length === 0) {
      console.warn('⚠️ Could not decode content with any encoding in fallback');
      return '<p>Could not read Word document. Please check if the file is corrupted or try a different file.</p>';
    }
    
    console.log('🔄 Using simple fallback extraction');
    console.log('📄 XML content length:', xmlContent.length);
    
    // Extract all text elements
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    
    if (textMatches && textMatches.length > 0) {
      console.log('📄 Found', textMatches.length, 'text elements');
      
      const allText = textMatches
        .map(match => {
          const text = match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1');
          // Clean up any encoding issues
          return text.replace(/[\uFFFD\uFFFE\uFFFF]/g, ''); // Remove replacement characters
        })
        .filter(text => text.trim().length > 0)
        .join(' ');
      
      console.log('📄 Extracted text length:', allText.length);
      console.log('📄 Text preview:', allText.substring(0, 200) + '...');
      
      // Check if text contains readable content
      if (allText.length === 0 || allText.match(/^[\s\uFFFD\uFFFE\uFFFF]*$/)) {
        console.warn('⚠️ Extracted text contains only whitespace or invalid characters');
        return '<p>No readable text found in Word document. The file may be corrupted or contain only images/drawings.</p>';
      }
      
      // Split into paragraphs
      const paragraphs = allText
        .split(/\s{2,}|\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0 && !p.match(/^[\s\uFFFD\uFFFE\uFFFF]*$/));
      
      console.log('📄 Created', paragraphs.length, 'paragraphs');
      
      if (paragraphs.length > 0) {
        const htmlContent = paragraphs.map(p => `<p>${p}</p>`).join('\n');
        console.log('✅ Simple extraction successful');
        return htmlContent;
      }
    }
    
    // Try alternative extraction methods
    console.log('🔄 Trying alternative extraction methods');
    
    // Try to find any text content
    const anyTextMatch = xmlContent.match(/>([^<>]{10,})</g);
    if (anyTextMatch && anyTextMatch.length > 0) {
      console.log('📄 Found', anyTextMatch.length, 'potential text blocks');
      
      const extractedText = anyTextMatch
        .map(match => match.replace(/[<>]/g, ''))
        .filter(text => text.trim().length > 5)
        .slice(0, 10); // Limit to first 10 blocks
      
      if (extractedText.length > 0) {
        const htmlContent = extractedText.map(text => `<p>${text.trim()}</p>`).join('\n');
        console.log('✅ Alternative extraction successful');
        return htmlContent;
      }
    }
    
    console.warn('⚠️ No meaningful content found');
    return '<p>No readable content found in Word document. Please check if the file contains text content.</p>';
  } catch (error) {
    console.error('❌ Error in simple extraction:', error);
    return '<p>Error extracting content from Word document. Please try a different file.</p>';
  }
};

// Test function to debug Word import
export const testWordImport = async (file: File): Promise<any> => {
  try {
    console.log('🧪 Testing Word import...');
    console.log('📄 File name:', file.name);
    console.log('📄 File size:', file.size, 'bytes');
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('utf-8');
    const xmlContent = textDecoder.decode(uint8Array);
    
    const result = {
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      xmlInfo: {
        length: xmlContent.length,
        preview: xmlContent.substring(0, 500),
        hasDocument: xmlContent.includes('<w:document'),
        hasBody: xmlContent.includes('<w:body'),
        hasParagraphs: xmlContent.includes('<w:p'),
        hasText: xmlContent.includes('<w:t')
      },
      extractedContent: null as string | null
    };
    
    // Try to extract content
    try {
      result.extractedContent = await extractWordContent(arrayBuffer);
    } catch (error) {
      console.error('❌ Content extraction failed:', error);
      result.extractedContent = 'Extraction failed: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('🧪 Test results:', result);
    return result;
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
