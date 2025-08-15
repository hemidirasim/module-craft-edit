import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { name, parent_id } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Create folder
    const folder = await prisma.folders.create({
      data: {
        user_id: user.id,
        name,
        parent_id: parent_id || null,
      },
    });

    res.status(201).json({
      success: true,
      folder,
    });
  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
}
