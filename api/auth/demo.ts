import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await AuthService.createDemoUser();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Demo user creation error:', error);
    res.status(500).json({ error: 'Demo user creation failed' });
  }
}
