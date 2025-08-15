import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { widgetId } = req.query;
    
    if (!widgetId || typeof widgetId !== 'string') {
      return res.status(400).send('Widget ID required');
    }

    // Fetch widget configuration from database
    const widget = await prisma.editorWidget.findFirst({
      where: {
        id: widgetId,
        isActive: true,
      },
    });
    
    if (!widget) {
      return res.status(404).send('Widget not found or inactive');
    }

    const config = widget.configuration || {};

    // Track widget usage (fire and forget)
    const referer = req.headers.referer || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     'unknown';

    // Extract domain from referer
    let domain = 'unknown';
    try {
      if (referer !== 'unknown') {
        domain = new URL(referer).hostname;
      }
    } catch (e) {
      console.log('Failed to parse referer domain:', e);
    }

    // Log usage (fire and forget)
    prisma.widgetUsage.create({
      data: {
        widgetId,
        domain,
        pageUrl: referer,
        userAgent,
        ipAddress: clientIP.split(',')[0].trim(),
      },
    }).catch(err => console.error('Failed to log usage:', err));

    // Generate the widget JavaScript
    const widgetJS = `
(function() {
  'use strict';
  
  // Widget configuration
  const WIDGET_CONFIG = ${JSON.stringify(config)};
  const WIDGET_ID = '${widgetId}';
  
  // Find target container
  const container = document.getElementById('custom-editor-widget');
  if (!container) {
    console.error('EditorCraft: Container with id "custom-editor-widget" not found');
    return;
  }

  // Enhanced CSS styles matching dashboard design with customization
  const fontFamily = WIDGET_CONFIG.enableCustomFont ? (WIDGET_CONFIG.fontFamily || 'Inter') : 'Inter';
  const fontSize = WIDGET_CONFIG.enableCustomFont ? (WIDGET_CONFIG.fontSize || '14px') : '14px';
  const backgroundColor = WIDGET_CONFIG.enableCustomBackground ? (WIDGET_CONFIG.backgroundColor || '#ffffff') : '#ffffff';
  const textColor = WIDGET_CONFIG.enableCustomBackground ? (WIDGET_CONFIG.textColor || '#1f2937') : '#1f2937';
  
  // Load Google Fonts if needed
  const googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
  if (WIDGET_CONFIG.enableCustomFont && googleFonts.includes(fontFamily) && !document.querySelector(\`link[href*="\${fontFamily}"]\`)) {
    const fontLink = document.createElement('link');
    fontLink.href = \`https://fonts.googleapis.com/css2?family=\${fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap\`;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
  }
  
  const styles = \`
    .editorcraft-container {
      font-family: "\${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      border: 1px solid hsl(214, 32%, 91%);
      border-radius: 12px;
      overflow: hidden;
      background: \${backgroundColor};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: box-shadow 0.3s ease;
    }
    
    .editorcraft-container:focus-within {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .editorcraft-toolbar {
      background: hsl(210, 40%, 98%);
      border-bottom: 1px solid hsl(214, 32%, 91%);
      padding: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      backdrop-filter: blur(8px);
    }
    
    .editorcraft-btn-group {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .editorcraft-btn-group:not(:last-child)::after {
      content: '';
      width: 1px;
      height: 24px;
      background: hsl(214, 32%, 91%);
      margin-left: 6px;
    }
    
     .editorcraft-btn {
       background: hsl(0, 0%, 100%);
       border: 1px solid hsl(220, 13%, 91%);
       border-radius: 6px;
       padding: 8px;
       cursor: pointer;
       font-size: 14px;
       font-weight: 500;
       transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
       min-width: 36px;
       height: 36px;
       display: flex;
       align-items: center;
       justify-content: center;
       color: hsl(222, 84%, 4.9%);
     }
     
     .editorcraft-btn:hover {
       background: hsl(210, 40%, 96%);
       border-color: hsl(217, 32%, 78%);
       transform: translateY(-1px);
     }
     
     .editorcraft-btn.active {
       background: hsl(221, 83%, 53%);
       color: hsl(210, 40%, 98%);
       border-color: hsl(221, 83%, 53%);
       box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
     }
     
     .editorcraft-editor {
       min-height: 300px;
       padding: 16px;
       outline: none;
       line-height: 1.6;
       font-size: \${fontSize};
       color: \${textColor};
       background: \${backgroundColor};
       font-family: "\${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
     }
     
     .editorcraft-editor:focus {
       outline: 2px solid hsl(221, 83%, 53%);
       outline-offset: -2px;
     }
     
     .editorcraft-editor:empty:before {
       content: "Start writing...";
       color: hsl(215, 16%, 47%);
       pointer-events: none;
       font-style: italic;
     }
   \`;
  
  // Inject styles if not already present
  if (!document.getElementById('editorcraft-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'editorcraft-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  // SVG icons
  const icons = {
    bold: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
    italic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
    underline: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
    link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'
  };
  
  // Create toolbar HTML
  const toolbarHTML = \`
    <div class="editorcraft-btn-group">
      <button class="editorcraft-btn" data-command="bold" title="Bold" \${WIDGET_CONFIG.enableBold === false ? 'disabled' : ''}>\${icons.bold}</button>
      <button class="editorcraft-btn" data-command="italic" title="Italic" \${WIDGET_CONFIG.enableItalic === false ? 'disabled' : ''}>\${icons.italic}</button>
      <button class="editorcraft-btn" data-command="underline" title="Underline" \${WIDGET_CONFIG.enableUnderline === false ? 'disabled' : ''}>\${icons.underline}</button>
    </div>
    <div class="editorcraft-btn-group">
      <button class="editorcraft-btn" data-command="createLink" title="Insert Link" \${WIDGET_CONFIG.enableLink === false ? 'disabled' : ''}>\${icons.link}</button>
      <button class="editorcraft-btn" data-command="insertImage" title="Insert Image" \${WIDGET_CONFIG.enableImage === false ? 'disabled' : ''}>\${icons.image}</button>
    </div>
  \`;
  
  // Create editor HTML
  const editorHTML = \`
    <div class="editorcraft-container">
      <div class="editorcraft-toolbar">\${toolbarHTML}</div>
      <div class="editorcraft-editor" contenteditable="true"></div>
    </div>
  \`;
  
  container.innerHTML = editorHTML;
  
  // Get references
  const toolbar = container.querySelector('.editorcraft-toolbar');
  const editor = container.querySelector('.editorcraft-editor');
  
  // Initialize event listeners
  if (toolbar && editor) {
    // Toolbar click handler
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.editorcraft-btn');
      if (btn && !btn.disabled) {
        e.preventDefault();
        const command = btn.dataset.command;
        
        editor.focus();
        
        if (command === 'createLink') {
          const url = prompt('Enter URL:');
          if (url) {
            document.execCommand(command, false, url);
          }
        } else if (command === 'insertImage') {
          const url = prompt('Enter image URL:');
          if (url) {
            document.execCommand('insertImage', false, url);
          }
        } else {
          document.execCommand(command, false, null);
        }
        
        updateToolbarState();
      }
    });
    
    // Update toolbar state
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('focus', updateToolbarState);
    
    function updateToolbarState() {
      const buttons = toolbar.querySelectorAll('.editorcraft-btn');
      buttons.forEach(btn => {
        const command = btn.dataset.command;
        if (command && document.queryCommandState) {
          btn.classList.toggle('active', document.queryCommandState(command));
        }
      });
    }
    
    // Initialize toolbar state
    setTimeout(updateToolbarState, 100);
  }
  
  console.log('EditorCraft widget loaded successfully');
})();
`;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    res.send(widgetJS);

  } catch (error) {
    console.error('Error in widget-js function:', error);
    res.status(500).send(`console.error('EditorCraft: ${error.message}');`);
  }
}
