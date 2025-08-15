import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    const { folder_id } = req.query;

    // Fetch files
    const files = await prisma.files.findMany({
      where: {
        user_id: user.id,
        folder_id: folder_id ? String(folder_id) : null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Fetch folders
    const folders = await prisma.folders.findMany({
      where: {
        user_id: user.id,
        parent_id: folder_id ? String(folder_id) : null,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    res.json({
      success: true,
      files,
      folders,
    });
  } catch (error) {
    console.error('Files fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
}
