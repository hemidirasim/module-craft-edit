import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../src/lib/prisma';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, fileName, fileData, fileType, fileSize, folderId } = req.body;
    
    if (!userId || !fileName || !fileData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Determine file type
    let fileTypeCategory = 'other';
    if (fileType && fileType.startsWith('image/')) fileTypeCategory = 'image';
    else if (fileType && fileType.startsWith('video/')) fileTypeCategory = 'video';
    else if (fileType && fileType.includes('pdf')) fileTypeCategory = 'pdf';
    else if (fileType && (fileType.includes('excel') || fileType.includes('spreadsheet'))) fileTypeCategory = 'excel';
    else if (fileType && (fileType.includes('word') || fileType.includes('document'))) fileTypeCategory = 'document';
    
    // Create public URL (for Vercel, we'll use a placeholder for now)
    const publicUrl = `/api/files/${userId}/${fileName}`;
    
    // Save file record to database
    const fileRecord = await prisma.file.create({
      data: {
        userId,
        originalName: fileName.split('_').slice(1).join('_'), // Remove timestamp prefix
        name: fileName,
        storagePath: fileName,
        fileSize: BigInt(fileSize || 0),
        fileType: fileTypeCategory,
        mimeType: fileType || 'application/octet-stream',
        folderId: folderId || null,
        publicUrl,
      },
    });
    
    res.json({
      success: true,
      file: fileRecord
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
