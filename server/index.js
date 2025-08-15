const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PostgreSQL server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, '../uploads')}`);
});

module.exports = app;
