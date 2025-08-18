import { FileManager } from '@/components/FileManager';
import { useAuth } from '@/hooks/useAuth';

export default function FileManagerPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">File Manager</h1>
          <p className="text-muted-foreground">
            Manage your files and folders
          </p>
        </div>
        
        <FileManager isGuestMode={!user} />
      </div>
    </div>
  );
}