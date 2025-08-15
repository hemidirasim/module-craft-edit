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

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const session = await AuthService.signUp(email, password);

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ error: 'User already exists' });
      }
    }
    
    res.status(500).json({ error: 'Signup failed' });
  }
}
