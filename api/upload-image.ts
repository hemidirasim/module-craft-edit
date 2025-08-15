import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, fileName, fileData, fileType } = req.body;
    
    if (!userId || !fileName || !fileData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate file type
    if (!fileType || !fileType.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }
    
    // For Vercel, we'll use a placeholder URL
    // In production, you might want to use a service like Cloudinary, AWS S3, or similar
    const publicUrl = `/api/files/${userId}/${fileName}`;
    
    res.json({
      url: publicUrl,
      filename: fileName
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
