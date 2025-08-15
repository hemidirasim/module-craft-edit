import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

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

    const { folderId } = req.query;

    if (!folderId || typeof folderId !== 'string') {
      return res.status(400).json({ error: 'Folder ID is required' });
    }

    // Get folder record
    const folder = await prisma.folders.findFirst({
      where: {
        id: folderId,
        user_id: user.id,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Delete folder and all its contents (cascade)
    await prisma.folders.delete({
      where: {
        id: folderId,
      },
    });

    res.json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error) {
    console.error('Folder deletion error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
}
