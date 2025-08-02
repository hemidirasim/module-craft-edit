import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const widgetId = url.pathname.split('/').pop()?.replace('.js', '');
    
    if (!widgetId) {
      return new Response('Widget ID required', { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return new Response('Configuration error', { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Fetch widget configuration
    const widgetResponse = await fetch(
      `${supabaseUrl}/rest/v1/editor_widgets?id=eq.${widgetId}&is_active=eq.true&select=*,workspaces(domain)`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!widgetResponse.ok) {
      console.error('Failed to fetch widget:', widgetResponse.status);
      return new Response('Widget not found', { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    const widgets = await widgetResponse.json();
    
    if (!widgets || widgets.length === 0) {
      return new Response('Widget not found or inactive', { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    const widget = widgets[0];
    const config = widget.configuration || {};

    // Track widget usage
    const referer = req.headers.get('referer') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
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
    fetch(`${supabaseUrl}/rest/v1/rpc/increment_widget_usage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        _widget_id: widgetId,
        _domain: domain,
        _page_url: referer,
        _user_agent: userAgent,
        _ip_address: clientIP.split(',')[0].trim()
      })
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
     
     .editorcraft-select {
       background: hsl(0, 0%, 100%);
       border: 1px solid hsl(220, 13%, 91%);
       border-radius: 6px;
       padding: 8px 12px;
       cursor: pointer;
       font-size: 14px;
       font-weight: 500;
       height: 36px;
       min-width: 80px;
       color: hsl(222, 84%, 4.9%);
     }
     
     .editorcraft-select:hover {
       background: hsl(210, 40%, 96%);
       border-color: hsl(217, 32%, 78%);
     }
     
     .editorcraft-color-picker {
       position: relative;
     }
     
     .editorcraft-color-palette {
       position: absolute;
       top: 100%;
       left: 0;
       background: hsl(0, 0%, 100%);
       border: 1px solid hsl(220, 13%, 91%);
       border-radius: 6px;
       padding: 8px;
       display: grid;
       grid-template-columns: repeat(6, 1fr);
       gap: 4px;
       z-index: 1000;
       box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
       margin-top: 4px;
     }
     
     .editorcraft-color-btn {
       width: 24px;
       height: 24px;
       border: 1px solid hsl(220, 13%, 91%);
       border-radius: 4px;
       cursor: pointer;
       transition: transform 0.2s ease;
     }
     
     .editorcraft-color-btn:hover {
       transform: scale(1.1);
       border-color: hsl(221, 83%, 53%);
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
     
     .editorcraft-editor p {
       margin: 0 0 1em 0;
     }
     
     .editorcraft-editor p:last-child {
       margin-bottom: 0;
     }
     
     .editorcraft-editor h1, .editorcraft-editor h2, .editorcraft-editor h3 {
       font-weight: 600;
       margin: 1.5em 0 0.5em 0;
       line-height: 1.2;
     }
     
     .editorcraft-editor h1 { font-size: 1.875em; }
     .editorcraft-editor h2 { font-size: 1.5em; }
     .editorcraft-editor h3 { font-size: 1.25em; }
     
     .editorcraft-editor blockquote {
       border-left: 4px solid hsl(221, 83%, 53%);
       padding-left: 16px;
       margin: 1em 0;
       font-style: italic;
       color: hsl(215, 16%, 47%);
     }
     
     .editorcraft-editor pre {
       background: hsl(220, 13%, 95%);
       border: 1px solid hsl(220, 13%, 91%);
       border-radius: 6px;
       padding: 12px;
       font-family: ui-monospace, SFMono-Regular, "Cascadia Code", "Roboto Mono", monospace;
       font-size: 13px;
       overflow-x: auto;
       margin: 1em 0;
     }
     
     .editorcraft-editor a {
       color: hsl(221, 83%, 53%);
       text-decoration: underline;
     }
     
     .editorcraft-editor a:hover {
       text-decoration: none;
     }
     
     .editorcraft-editor img {
       max-width: 100%;
       height: auto;
       border-radius: 6px;
       margin: 0.5em 0;
      }
      
      .editorcraft-html-editor {
        min-height: 300px;
        padding: 16px;
        outline: none;
        line-height: 1.4;
        font-size: 14px;
        font-family: ui-monospace, SFMono-Regular, "Cascadia Code", "Roboto Mono", monospace;
        color: \${textColor};
        background: \${backgroundColor};
        border: none;
        resize: none;
        width: 100%;
        box-sizing: border-box;
      }
      
      .editorcraft-html-editor:focus {
        outline: 2px solid hsl(221, 83%, 53%);
        outline-offset: -2px;
      }
   \`;
  
  // Inject styles if not already present
  if (!document.getElementById('editorcraft-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'editorcraft-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  // SVG icons matching dashboard design
  const icons = {
    bold: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
    italic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
    underline: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
    strikethrough: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
    link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>',
    html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4,7 4,4 20,4 20,7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><path d="M14 7h-4l-2 2 2 2h4m0-4h4l2-2-2-2h-4"/></svg>',
    type: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4,7 4,4 20,4 20,7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    palette: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    alignLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="11" y1="14" x2="3" y2="14"/><line x1="11" y1="18" x2="3" y2="18"/></svg>',
    alignCenter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="16" y1="14" x2="8" y2="14"/><line x1="16" y1="18" x2="8" y2="18"/></svg>',
    alignRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="13" y2="14"/><line x1="21" y1="18" x2="13" y2="18"/></svg>'
  };
  
  // Create toolbar groups matching dashboard
  const toolbarGroups = [
    {
      name: 'formatting',
      tools: [
        { icon: 'bold', command: 'bold', tooltip: 'Bold', enabled: WIDGET_CONFIG.enableBold !== false },
        { icon: 'italic', command: 'italic', tooltip: 'Italic', enabled: WIDGET_CONFIG.enableItalic !== false },
        { icon: 'underline', command: 'underline', tooltip: 'Underline', enabled: WIDGET_CONFIG.enableUnderline !== false },
        { icon: 'strikethrough', command: 'strikeThrough', tooltip: 'Strikethrough', enabled: WIDGET_CONFIG.enableStrikethrough !== false }
      ]
    },
    {
      name: 'font',
      tools: [
        { icon: 'type', command: 'fontName', tooltip: 'Font Family', enabled: WIDGET_CONFIG.enableFont !== false, isDropdown: true, type: 'fontFamily' },
        { icon: 'type', command: 'fontSize', tooltip: 'Font Size', enabled: WIDGET_CONFIG.enableFont !== false, isDropdown: true, type: 'fontSize' }
      ]
    },
    {
      name: 'color',
      tools: [
        { icon: 'palette', command: 'foreColor', tooltip: 'Text Color', enabled: WIDGET_CONFIG.enableColor !== false, isDropdown: true, type: 'color' }
      ]
    },
    {
      name: 'alignment',
      tools: [
        { icon: 'alignLeft', command: 'justifyLeft', tooltip: 'Align Left', enabled: WIDGET_CONFIG.enableAlignment !== false },
        { icon: 'alignCenter', command: 'justifyCenter', tooltip: 'Align Center', enabled: WIDGET_CONFIG.enableAlignment !== false },
        { icon: 'alignRight', command: 'justifyRight', tooltip: 'Align Right', enabled: WIDGET_CONFIG.enableAlignment !== false }
      ]
    },
    {
      name: 'content',
      tools: [
        { icon: 'link', command: 'createLink', tooltip: 'Insert Link', enabled: WIDGET_CONFIG.enableLink !== false },
        { icon: 'image', command: 'insertImage', tooltip: 'Insert Image', enabled: WIDGET_CONFIG.enableImage !== false },
        { icon: 'html', command: 'toggleHtmlView', tooltip: 'HTML View', enabled: WIDGET_CONFIG.enableCode !== false }
      ]
    }
  ];
  
  // Font families and sizes for dropdowns
  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Tahoma', 'Comic Sans MS', 'Impact', 'Trebuchet MS'];
  const fontSizes = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
  const colors = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'];

  // Generate toolbar HTML
  let toolbarHTML = '';
  toolbarGroups.forEach((group, groupIndex) => {
    const enabledTools = group.tools.filter(tool => tool.enabled);
    if (enabledTools.length > 0) {
      toolbarHTML += '<div class="editorcraft-btn-group">';
      enabledTools.forEach(tool => {
        if (tool.isDropdown) {
          if (tool.type === 'fontFamily') {
            toolbarHTML += \`
              <select class="editorcraft-select" data-command="\${tool.command}" title="\${tool.tooltip}">
                <option value="">Font</option>
                \${fontFamilies.map(font => \`<option value="\${font}" style="font-family: \${font};">\${font}</option>\`).join('')}
              </select>\`;
          } else if (tool.type === 'fontSize') {
            toolbarHTML += \`
              <select class="editorcraft-select" data-command="\${tool.command}" title="\${tool.tooltip}">
                <option value="">Size</option>
                \${fontSizes.map(size => \`<option value="\${size}">\${size}</option>\`).join('')}
              </select>\`;
          } else if (tool.type === 'color') {
            toolbarHTML += \`
              <div class="editorcraft-color-picker" title="\${tool.tooltip}">
                <button class="editorcraft-btn" data-command="color-picker">\${icons[tool.icon]}</button>
                <div class="editorcraft-color-palette" style="display: none;">
                  \${colors.map(color => \`<button class="editorcraft-color-btn" data-color="\${color}" style="background-color: \${color};" title="\${color}"></button>\`).join('')}
                </div>
              </div>\`;
          }
        } else {
          toolbarHTML += \`<button class="editorcraft-btn" data-command="\${tool.command}" \${tool.value ? \`data-value="\${tool.value}"\` : ''} title="\${tool.tooltip}">\${icons[tool.icon]}</button>\`;
        }
      });
      toolbarHTML += '</div>';
    }
  });
  
  // Create editor HTML
  const editorHTML = \`
    <div class="editorcraft-container">
      <div class="editorcraft-toolbar">\${toolbarHTML}</div>
      <div class="editorcraft-editor" contenteditable="true"></div>
    </div>
  \`;
  
  container.innerHTML = editorHTML;
  
  // Widget state
  let isHtmlView = false;
  
  // Add event listeners
  const toolbar = container.querySelector('.editorcraft-toolbar');
  let editor = container.querySelector('.editorcraft-editor');
  
  // Toggle between visual and HTML view
  function toggleHtmlView() {
    const editorContainer = container.querySelector('.editorcraft-container');
    const toolbarElement = editorContainer.querySelector('.editorcraft-toolbar');
    const currentEditor = editorContainer.querySelector('.editorcraft-editor, .editorcraft-html-editor');
    
    if (isHtmlView) {
      // Switch to visual view - HTML -> Visual
      const htmlContent = currentEditor.value || '';
      currentEditor.remove();
      
      const visualEditor = document.createElement('div');
      visualEditor.className = 'editorcraft-editor';
      visualEditor.contentEditable = 'true';
      visualEditor.innerHTML = htmlContent;
      editorContainer.appendChild(visualEditor);
      
      editor = visualEditor;
      isHtmlView = false;
    } else {
      // Switch to HTML view - Visual -> HTML
      const visualContent = currentEditor.innerHTML || '';
      console.log('Visual content:', visualContent); // Debug log
      currentEditor.remove();
      
      const htmlEditor = document.createElement('textarea');
      htmlEditor.className = 'editorcraft-html-editor';
      htmlEditor.value = visualContent;
      htmlEditor.placeholder = '<p>Enter HTML here...</p>';
      editorContainer.appendChild(htmlEditor);
      
      editor = htmlEditor;
      isHtmlView = true;
    }
    
    // Re-attach event listeners for the new editor
    attachEditorEvents();
  }
  
  function attachEditorEvents() {
    if (!editor) return;
    
    // Remove existing listeners to avoid duplicates
    const newToolbar = container.querySelector('.editorcraft-toolbar');
    const newEditor = container.querySelector('.editorcraft-editor, .editorcraft-html-editor');
    
    // Clone toolbar to remove all event listeners
    const cleanToolbar = newToolbar.cloneNode(true);
    newToolbar.parentNode.replaceChild(cleanToolbar, newToolbar);
    
    // Update references
    const toolbar = cleanToolbar;
    editor = newEditor;
    
    // Toolbar click handler
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.editorcraft-btn');
      const select = e.target.closest('.editorcraft-select');
      const colorBtn = e.target.closest('.editorcraft-color-btn');
      
      if (colorBtn) {
        e.preventDefault();
        const color = colorBtn.dataset.color;
        if (!isHtmlView) {
          editor.focus();
          document.execCommand('foreColor', false, color);
        }
        // Hide color palette
        colorBtn.closest('.editorcraft-color-palette').style.display = 'none';
        updateToolbarState();
        return;
      }
      
      if (btn) {
        e.preventDefault();
        const command = btn.dataset.command;
        const value = btn.dataset.value;
        
        if (command === 'toggleHtmlView') {
          toggleHtmlView();
          return;
        }
        
        if (command === 'color-picker') {
          const palette = btn.parentElement.querySelector('.editorcraft-color-palette');
          palette.style.display = palette.style.display === 'none' ? 'grid' : 'none';
          return;
        }
        
        if (!isHtmlView) {
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
            document.execCommand(command, false, value);
          }
          
          updateToolbarState();
        }
      }
    });
    
    // Select change handler
    toolbar.addEventListener('change', (e) => {
      const select = e.target.closest('.editorcraft-select');
      if (select) {
        const command = select.dataset.command;
        const value = select.value;
        if (value && !isHtmlView) {
          editor.focus();
          document.execCommand(command, false, value);
          updateToolbarState();
        }
      }
    });
    
    // Keyboard shortcuts matching dashboard
    editor.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            if (WIDGET_CONFIG.enableBold !== false) {
              e.preventDefault();
              document.execCommand('bold');
              updateToolbarState();
            }
            break;
          case 'i':
            if (WIDGET_CONFIG.enableItalic !== false) {
              e.preventDefault();
              document.execCommand('italic');
              updateToolbarState();
            }
            break;
          case 'u':
            if (WIDGET_CONFIG.enableUnderline !== false) {
              e.preventDefault();
              document.execCommand('underline');
              updateToolbarState();
            }
            break;
        }
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
    
    // Apply custom styling if configured
    if (WIDGET_CONFIG.customCSS) {
      const customStyle = document.createElement('style');
      customStyle.textContent = WIDGET_CONFIG.customCSS;
      document.head.appendChild(customStyle);
    }
    
    // Initialize toolbar state
    setTimeout(updateToolbarState, 100);
  }
  
  // Initialize event listeners
  if (toolbar && editor) {
    attachEditorEvents();
  }
  
  console.log('EditorCraft widget loaded successfully');
})();
`;

    return new Response(widgetJS, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });

  } catch (error) {
    console.error('Error in widget-js function:', error);
    return new Response(`console.error('EditorCraft: ${error.message}');`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/javascript' }
    });
  }
});