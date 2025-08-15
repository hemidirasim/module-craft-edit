import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const session = await AuthService.signIn(email, password);

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Signin error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    res.status(500).json({ error: 'Signin failed' });
  }
}
