import { v4 as uuidv4 } from 'uuid';

const DEMO_SESSION_KEY = 'demoSessionId';

export const getOrCreateDemoSession = async (): Promise<string> => {
  let sessionId = localStorage.getItem(DEMO_SESSION_KEY);
  
  if (!sessionId) {
    try {
      const response = await fetch('/api/demo/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        sessionId = data.sessionId;
        localStorage.setItem(DEMO_SESSION_KEY, sessionId);
      } else {
        throw new Error('Failed to create demo session');
      }
    } catch (error) {
      console.error('Error creating demo session:', error);
      // Fallback: create a local session ID
      sessionId = uuidv4();
      localStorage.setItem(DEMO_SESSION_KEY, sessionId);
    }
  }

  return sessionId;
};

export const clearDemoSession = (): void => {
  localStorage.removeItem(DEMO_SESSION_KEY);
};

export const forceRefreshDemoSession = async (): Promise<string> => {
  clearDemoSession();
  return await getOrCreateDemoSession();
};

export const addDemoFileToPrisma = async (
  sessionId: string,
  originalName: string,
  fileType: string,
  fileSize: number,
  publicUrl: string,
  storagePath: string
) => {
  try {
    const response = await fetch('/api/demo/add-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        originalName,
        fileType,
        fileSize,
        publicUrl,
        storagePath,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.file;
    } else {
      throw new Error('Failed to add demo file');
    }
  } catch (error) {
    console.error('Error adding demo file:', error);
    throw error;
  }
};

export const getDemoFilesFromPrisma = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/demo/get-files?sessionId=${sessionId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.files || [];
    } else {
      throw new Error('Failed to get demo files');
    }
  } catch (error) {
    console.error('Error getting demo files:', error);
    return [];
  }
};
