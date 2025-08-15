import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';
import { del } from '@vercel/blob';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await AuthService.getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { fileId } = req.query;

    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file record
    const file = await prisma.files.findFirst({
      where: {
        id: fileId,
        user_id: user.id,
      },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from Vercel Blob
    try {
      await del(file.storage_path);
    } catch (blobError) {
      console.warn('Blob deletion failed:', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.files.delete({
      where: {
        id: fileId,
      },
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
}
