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

  // Inject CSS styles
  const styles = \`
    .editorcraft-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .editorcraft-toolbar {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 8px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    
    .editorcraft-btn {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
      min-width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .editorcraft-btn:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
    
    .editorcraft-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    
    .editorcraft-editor {
      min-height: 200px;
      padding: 16px;
      outline: none;
      line-height: 1.6;
      font-size: 14px;
    }
    
    .editorcraft-editor:focus {
      box-shadow: inset 0 0 0 2px #3b82f6;
    }
    
    .editorcraft-editor:empty:before {
      content: "Start typing...";
      color: #9ca3af;
      pointer-events: none;
    }
  \`;
  
  // Inject styles if not already present
  if (!document.getElementById('editorcraft-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'editorcraft-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  // Create editor HTML
  const editorHTML = \`
    <div class="editorcraft-container">
      <div class="editorcraft-toolbar">
        \${WIDGET_CONFIG.enableBold !== false ? '<button class="editorcraft-btn" data-command="bold" title="Bold"><b>B</b></button>' : ''}
        \${WIDGET_CONFIG.enableItalic !== false ? '<button class="editorcraft-btn" data-command="italic" title="Italic"><i>I</i></button>' : ''}
        \${WIDGET_CONFIG.enableUnderline !== false ? '<button class="editorcraft-btn" data-command="underline" title="Underline"><u>U</u></button>' : ''}
        \${WIDGET_CONFIG.enableStrikethrough !== false ? '<button class="editorcraft-btn" data-command="strikeThrough" title="Strikethrough"><s>S</s></button>' : ''}
        \${WIDGET_CONFIG.enableLink !== false ? '<button class="editorcraft-btn" data-command="createLink" title="Insert Link">🔗</button>' : ''}
        \${WIDGET_CONFIG.enableImage !== false ? '<button class="editorcraft-btn" data-command="insertImage" title="Insert Image">🖼️</button>' : ''}
        \${WIDGET_CONFIG.enableCode !== false ? '<button class="editorcraft-btn" data-command="formatBlock" data-value="pre" title="Code Block">&lt;&gt;</button>' : ''}
      </div>
      <div class="editorcraft-editor" contenteditable="true"></div>
    </div>
  \`;
  
  container.innerHTML = editorHTML;
  
  // Add event listeners
  const toolbar = container.querySelector('.editorcraft-toolbar');
  const editor = container.querySelector('.editorcraft-editor');
  
  if (toolbar && editor) {
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.editorcraft-btn');
      if (!btn) return;
      
      e.preventDefault();
      const command = btn.dataset.command;
      const value = btn.dataset.value;
      
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
      
      // Update button states
      updateToolbarState();
    });
    
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    
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