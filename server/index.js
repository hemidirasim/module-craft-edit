const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const { Pool } = require('pg');

// PostgreSQL client
const pool = new Pool({
  host: 'j3mn.your-database.de',
  port: 5432,
  database: 'editorcraft',
  user: 'editorcraft_2',
  password: 'J4Nay8jyhUKd9gNe',
  ssl: { rejectUnauthorized: false },
});

const app = express();
const PORT = process.env.PORT || 3001;

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files serve
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// File serve endpoint
app.get('/api/files/:userId/:fileName', (req, res) => {
  const { userId, fileName } = req.params;
  const filePath = path.join(__dirname, '../uploads', userId, fileName);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // MIME type təyin et
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg'
  };
  
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// File upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { userId, fileName, fileData, fileType, fileSize } = req.body;
    
    if (!userId || !fileName || !fileData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const uploadDir = path.join(__dirname, '../uploads', userId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(fileData, 'base64');
    
    fs.writeFileSync(filePath, buffer);
    
    const publicUrl = `/api/files/${userId}/${fileName}`;
    
    res.json({
      success: true,
      fileName,
      filePath,
      publicUrl,
      fileSize: buffer.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      success: true,
      currentTime: result.rows[0].current_time,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed'
    });
  }
});

// Auth endpoints
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      session: {
        user: {
          id: user.id,
          email: user.email
        },
        access_token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      session: {
        user: {
          id: user.id,
          email: user.email
        },
        access_token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    console.log('🔍 Verify request headers:', req.headers);
    
    // Check for token in Authorization header first
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('🔍 Token from Authorization header:', token ? 'exists' : 'not found');
    } else {
      // Fallback to body parameter
      token = req.body.token;
      console.log('🔍 Token from body:', token ? 'exists' : 'not found');
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ error: 'Token is required' });
    }

    console.log('🔍 Verifying token...');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified, userId:', decoded.userId);

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = userResult.rows[0];
    console.log('✅ User found:', user.email);

    const response = {
      success: true,
      session: {
        user: {
          id: user.id,
          email: user.email
        },
        access_token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    };

    console.log('✅ Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Verify error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Workspaces endpoints
app.get('/api/workspaces', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const result = await pool.query(
      'SELECT * FROM workspaces WHERE user_id = $1 ORDER BY created_at DESC',
      [decoded.userId]
    );

    res.json({
      success: true,
      workspaces: result.rows
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Failed to get workspaces' });
  }
});

app.post('/api/workspaces', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const { name, domain, description } = req.body;

    if (!name || !domain) {
      return res.status(400).json({ error: 'Name and domain are required' });
    }

    const result = await pool.query(
      'INSERT INTO workspaces (user_id, name, domain, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [decoded.userId, name, domain, description || '']
    );

    res.json({
      success: true,
      workspace: result.rows[0]
    });
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// File upload endpoint (replaces Supabase edge function)
app.post('/api/file-upload', upload.single('file'), async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    const folderId = req.body.folder_id || null;

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExt}`;
    const storagePath = `${userId}/${fileName}`;

    // Determine file type
    let fileType = 'other';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype.startsWith('video/')) fileType = 'video';
    else if (file.mimetype.includes('pdf')) fileType = 'pdf';
    else if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) fileType = 'excel';
    else if (file.mimetype.includes('word') || file.mimetype.includes('document')) fileType = 'document';

    // Save file record to database
    const result = await pool.query(
      `INSERT INTO files (user_id, folder_id, name, original_name, file_type, file_size, mime_type, storage_path, public_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        folderId,
        fileName,
        file.originalname,
        fileType,
        file.size,
        file.mimetype,
        storagePath,
        `/uploads/${storagePath}`
      ]
    );

    const fileRecord = result.rows[0];

    res.json({
      success: true,
      file: fileRecord
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Widget JS endpoint (replaces Supabase edge function)
app.get('/api/widget-js/:widgetId.js', async (req, res) => {
  try {
    const { widgetId } = req.params;
    
    if (!widgetId) {
      return res.status(400).send('Widget ID required');
    }

    // Get widget configuration from database
    const result = await pool.query(
      `SELECT ew.*, w.domain 
       FROM editor_widgets ew 
       JOIN workspaces w ON ew.workspace_id = w.id 
       WHERE ew.id = $1`,
      [widgetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Widget not found');
    }

    const widget = result.rows[0];
    const config = widget.configuration || {};

    // Track widget usage
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
    pool.query(
      `INSERT INTO widget_usage (widget_id, user_id, domain, page_url, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        widgetId,
        widget.workspace_id, // Using workspace_id as user_id for now
        domain,
        referer,
        userAgent,
        clientIP.split(',')[0].trim()
      ]
    ).catch(err => console.error('Failed to log usage:', err));

    // Generate the widget JavaScript (simplified version)
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

  // Create simple editor
  container.innerHTML = \`
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; min-height: 200px;">
      <div style="margin-bottom: 16px;">
        <button onclick="document.execCommand('bold')" style="margin-right: 8px;">Bold</button>
        <button onclick="document.execCommand('italic')" style="margin-right: 8px;">Italic</button>
        <button onclick="document.execCommand('underline')" style="margin-right: 8px;">Underline</button>
      </div>
      <div contenteditable="true" style="min-height: 150px; border: 1px solid #eee; padding: 8px; outline: none;">
        Start writing...
      </div>
    </div>
  \`;
  
  console.log('EditorCraft widget loaded successfully');
})();
`;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    res.send(widgetJS);

  } catch (error) {
    console.error('Error in widget-js endpoint:', error);
    res.status(500).send(`console.error('EditorCraft: ${error.message}');`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PostgreSQL server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, '../uploads')}`);
});

module.exports = app;
