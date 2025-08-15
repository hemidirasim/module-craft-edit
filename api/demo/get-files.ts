import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Find demo user by session ID
    const demoUser = await prisma.demoUser.findUnique({
      where: { sessionId },
      include: {
        demoFiles: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!demoUser) {
      return res.status(404).json({ error: 'Demo session not found' });
    }

    // Check if session is expired
    if (new Date() > demoUser.expiresAt) {
      return res.status(401).json({ error: 'Demo session expired' });
    }

    res.json({
      success: true,
      files: demoUser.demoFiles,
    });
  } catch (error) {
    console.error('Error getting demo files:', error);
    res.status(500).json({ error: 'Failed to get demo files' });
  }
}
