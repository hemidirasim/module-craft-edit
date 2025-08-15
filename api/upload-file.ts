import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import { AuthService } from '../../src/lib/auth';
import { prisma } from '../../src/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse multipart form data
    const formData = await new Promise<{ file: File; folder_id?: string }>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        try {
          const boundary = req.headers['content-type']?.split('boundary=')[1];
          if (!boundary) {
            reject(new Error('No boundary found'));
            return;
          }

          const buffer = Buffer.concat(chunks);
          const parts = buffer.toString().split(`--${boundary}`);
          
          let file: File | undefined;
          let folder_id: string | undefined;

          for (const part of parts) {
            if (part.includes('Content-Disposition: form-data')) {
              if (part.includes('name="file"')) {
                const fileMatch = part.match(/filename="([^"]+)"/);
                const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);
                const fileDataMatch = part.match(/\r\n\r\n([\s\S]*?)(?=\r\n--)/);
                
                if (fileMatch && fileDataMatch) {
                  const filename = fileMatch[1];
                  const contentType = contentTypeMatch?.[1] || 'application/octet-stream';
                  const fileBuffer = Buffer.from(fileDataMatch[1], 'binary');
                  
                  file = new File([fileBuffer], filename, { type: contentType });
                }
              } else if (part.includes('name="folder_id"')) {
                const folderMatch = part.match(/\r\n\r\n([\s\S]*?)(?=\r\n--)/);
                if (folderMatch) {
                  folder_id = folderMatch[1].trim();
                }
              }
            }
          }

          if (!file) {
            reject(new Error('No file provided'));
            return;
          }

          resolve({ file, folder_id });
        } catch (error) {
          reject(error);
        }
      });
    });

    const { file, folder_id } = formData;

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${user.id}/${fileName}`;

    // Determine file type
    let fileType = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.includes('pdf')) fileType = 'pdf';
    else if (file.type.includes('excel') || file.type.includes('spreadsheet')) fileType = 'excel';
    else if (file.type.includes('word') || file.type.includes('document')) fileType = 'document';

    // Upload to Vercel Blob
    const blob = await put(storagePath, file, {
      access: 'public',
    });

    // Save file record to database
    const fileRecord = await prisma.files.create({
      data: {
        user_id: user.id,
        folder_id: folder_id || null,
        name: fileName,
        original_name: file.name,
        file_type: fileType,
        file_size: BigInt(file.size),
        mime_type: file.type,
        storage_path: storagePath,
        public_url: blob.url,
      },
    });

    res.json({
      success: true,
      file: fileRecord
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
