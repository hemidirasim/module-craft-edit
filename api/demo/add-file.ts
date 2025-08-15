import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, originalName, fileType, fileSize, publicUrl, storagePath } = req.body;

    if (!sessionId || !originalName || !fileType || !fileSize || !publicUrl || !storagePath) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find demo user by session ID
    const demoUser = await prisma.demoUser.findUnique({
      where: { sessionId },
    });

    if (!demoUser) {
      return res.status(404).json({ error: 'Demo session not found' });
    }

    // Check if session is expired
    if (new Date() > demoUser.expiresAt) {
      return res.status(401).json({ error: 'Demo session expired' });
    }

    // Add demo file
    const demoFile = await prisma.demoFile.create({
      data: {
        demoUserId: demoUser.id,
        originalName,
        fileType,
        fileSize: BigInt(fileSize),
        publicUrl,
        storagePath,
      },
    });

    res.json({
      success: true,
      file: demoFile,
    });
  } catch (error) {
    console.error('Error adding demo file:', error);
    res.status(500).json({ error: 'Failed to add demo file' });
  }
}
