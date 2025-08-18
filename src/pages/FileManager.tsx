import { FileManager } from '@/components/FileManager';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

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
          <h1 className="text-3xl font-bold">
            {user ? 'File Manager' : 'Demo File Manager'}
          </h1>
          <p className="text-muted-foreground">
            {user 
              ? 'Manage your files and folders' 
              : 'Try our file manager in demo mode - no account required!'
            }
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                💡 Demo files are temporary and will be deleted after 1 hour. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-1"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign up for free
                </Button>
                {' '}to save files permanently.
              </p>
            </div>
          )}
        </div>
        
        <FileManager demoMode={!user} />
      </div>
    </div>
  );
}