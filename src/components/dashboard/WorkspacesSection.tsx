import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client'; // Deprecated - using new auth system
import { useAuth } from '@/components/auth/AuthProvider';
import { Plus, Globe, Settings } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  domain: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export const WorkspacesSection = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  const loadWorkspaces = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      toast({
        title: "Failed to load workspaces",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('workspaces')
        .insert([{
          user_id: user.id,
          name: formData.name,
          domain: formData.domain,
          description: formData.description
        }]);

      if (error) throw error;

      toast({
        title: "Workspace created!",
        description: "Your new workspace is ready to use.",
      });

      setFormData({ name: '', domain: '', description: '' });
      setShowCreateForm(false);
      loadWorkspaces();
    } catch (error: any) {
      toast({
        title: "Failed to create workspace",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading workspaces...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workspaces</h2>
          <p className="text-muted-foreground">
            Manage your editor workspaces and domains
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workspace</CardTitle>
            <CardDescription>
              Set up a new workspace for your domain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createWorkspace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="My Website Editor"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this workspace..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Workspace</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="hover:shadow-card transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {workspace.name}
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {workspace.domain}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {workspace.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  workspace.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {workspace.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Created {new Date(workspace.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workspaces.length === 0 && !showCreateForm && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No workspaces yet</h3>
                <p className="text-muted-foreground">
                  Create your first workspace to start building custom editors
                </p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};