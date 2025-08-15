"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("../src/integrations/postgresql/client");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static files serve
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// File serve endpoint
app.get('/api/files/:userId/:fileName', (req, res) => {
    const { userId, fileName } = req.params;
    const filePath = path_1.default.join(__dirname, '../uploads', userId, fileName);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    // MIME type təyin et
    const ext = path_1.default.extname(fileName).toLowerCase();
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
    const fileStream = fs_1.default.createReadStream(filePath);
    fileStream.pipe(res);
});
// File upload endpoint
app.post('/api/upload', async (req, res) => {
    try {
        const { userId, fileName, fileData, fileType, fileSize } = req.body;
        if (!userId || !fileName || !fileData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const uploadDir = path_1.default.join(__dirname, '../uploads', userId);
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path_1.default.join(uploadDir, fileName);
        const buffer = Buffer.from(fileData, 'base64');
        fs_1.default.writeFileSync(filePath, buffer);
        const publicUrl = `/api/files/${userId}/${fileName}`;
        res.json({
            success: true,
            fileName,
            filePath,
            publicUrl,
            fileSize: buffer.length
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});
// Database test endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await client_1.pool.query('SELECT NOW() as current_time');
        res.json({
            success: true,
            currentTime: result.rows[0].current_time,
            message: 'Database connection successful'
        });
    }
    catch (error) {
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
    console.log(`📁 Uploads directory: ${path_1.default.join(__dirname, '../uploads')}`);
});
exports.default = app;
