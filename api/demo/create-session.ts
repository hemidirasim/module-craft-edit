import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const demoUser = await prisma.demoUser.create({
      data: {
        sessionId,
        expiresAt,
      },
    });

    res.json({
      success: true,
      sessionId: demoUser.sessionId,
      expiresAt: demoUser.expiresAt,
    });
  } catch (error) {
    console.error('Error creating demo session:', error);
    res.status(500).json({ error: 'Failed to create demo session' });
  }
}
