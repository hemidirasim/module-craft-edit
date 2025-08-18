import { useState } from 'react';

// Static demo files - no upload needed
const DEMO_FILES = [
  {
    id: '1',
    file_name: 'sample-document.pdf',
    file_type: 'pdf',
    file_size: 245760,
    public_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '2', 
    file_name: 'company-logo.png',
    file_type: 'image',
    file_size: 89432,
    public_url: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Company+Logo',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: '3',
    file_name: 'presentation.pptx',
    file_type: 'document', 
    file_size: 1024000,
    public_url: 'https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-ppt-file.ppt',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: '4',
    file_name: 'data-analysis.xlsx',
    file_type: 'excel',
    file_size: 567890, 
    public_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-xlsx-file-for-testing.xlsx',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: '5',
    file_name: 'profile-image.jpg',
    file_type: 'image',
    file_size: 156789,
    public_url: 'https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Profile+Photo',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '6',
    file_name: 'demo-video.mp4',
    file_type: 'video',
    file_size: 2048000,
    public_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  }
];

interface DemoFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
}

export const useDemoFileManager = () => {
  const [files] = useState<DemoFile[]>(DEMO_FILES);
  const [loading] = useState(false);

  const getFileUrl = (file: DemoFile) => {
    return file.public_url;
  };

  const downloadFile = (file: DemoFile) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.public_url;
    link.download = file.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    files,
    loading,
    getFileUrl,
    downloadFile,
    refresh: () => {}, // No need to refresh static data
    isSessionValid: () => true, // Always valid for demo
  };
};