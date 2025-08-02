import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Plus, Code, Copy, Eye, Settings } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface Widget {
  id: string;
  name: string;
  configuration: any;
  is_active: boolean;
  embed_code: string;
  usage_count: number;
  workspace_id: string;
  workspaces: { name: string; domain: string };
}

interface Workspace {
  id: string;
  name: string;
  domain: string;
}

export const WidgetsSection = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    workspace_id: '',
    configuration: {
      enableBold: true,
      enableItalic: true,
      enableUnderline: true,
      enableStrikethrough: true,
      enableLink: true,
      enableImage: true,
      enableCode: true,
      enableCustomFont: false,
      enableCustomBackground: false,
      fontFamily: 'Inter',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    }
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [widgetsResult, workspacesResult] = await Promise.all([
        (supabase as any)
          .from('editor_widgets')
          .select('*, workspaces(name, domain)')
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('workspaces')
          .select('id, name, domain')
          .eq('is_active', true)
      ]);

      if (widgetsResult.error) throw widgetsResult.error;
      if (workspacesResult.error) throw workspacesResult.error;

      setWidgets(widgetsResult.data || []);
      setWorkspaces(workspacesResult.data || []);
    } catch (error) {
      toast({
        title: "Failed to load data",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('editor_widgets')
        .insert([{
          name: formData.name,
          workspace_id: formData.workspace_id,
          configuration: formData.configuration
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate embed code
      const embedCode = `<div id="custom-editor-widget"></div>\n<script src="https://qgmluixnzhpthywyrytn.supabase.co/functions/v1/widget-js/${data.id}.js"></script>`;
      
      await (supabase as any)
        .from('editor_widgets')
        .update({ embed_code: embedCode })
        .eq('id', data.id);

      toast({
        title: "Widget created!",
        description: "Your new widget is ready to embed.",
      });

      setFormData({
        name: '',
        workspace_id: '',
        configuration: {
          enableBold: true,
          enableItalic: true,
          enableUnderline: true,
          enableStrikethrough: true,
          enableLink: true,
          enableImage: true,
          enableCode: true,
          enableCustomFont: false,
          enableCustomBackground: false,
          fontFamily: 'Inter',
          fontSize: '14px',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
        }
      });
      setShowCreateForm(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to create widget",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyEmbedCode = (embedCode: string) => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied!",
      description: "You can now paste it into your website.",
    });
  };

  if (loading) {
    return <div>Loading widgets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Widgets</h2>
          <p className="text-muted-foreground">
            Create and manage your embeddable editors
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={workspaces.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          New Widget
        </Button>
      </div>

      {workspaces.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              You need to create a workspace first before you can create widgets.
            </p>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Widget</CardTitle>
            <CardDescription>
              Configure your custom rich text editor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createWidget} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Widget Name</Label>
                  <Input
                    id="name"
                    placeholder="My Editor Widget"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace">Workspace</Label>
                  <select
                    id="workspace"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={formData.workspace_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, workspace_id: e.target.value }))}
                    required
                  >
                    <option value="">Select workspace</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name} ({workspace.domain})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Enable Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(formData.configuration)
                    .filter(([key]) => key.startsWith('enable'))
                    .map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={value as boolean}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            configuration: { ...prev.configuration, [key]: checked }
                          }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key === 'enableCustomFont' ? 'Custom Font' :
                         key === 'enableCustomBackground' ? 'Custom Background' :
                         key.replace('enable', '')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {formData.configuration.enableCustomFont && (
                <div className="space-y-4">
                  <h4 className="font-medium">Font Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <select
                        id="fontFamily"
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={formData.configuration.fontFamily}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, fontFamily: e.target.value }
                        }))}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <select
                        id="fontSize"
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={formData.configuration.fontSize}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, fontSize: e.target.value }
                        }))}
                      >
                        <option value="12px">12px (Small)</option>
                        <option value="14px">14px (Default)</option>
                        <option value="16px">16px (Large)</option>
                        <option value="18px">18px (Extra Large)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formData.configuration.enableCustomBackground && (
                <div className="space-y-4">
                  <h4 className="font-medium">Background & Color Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.configuration.backgroundColor}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            configuration: { ...prev.configuration, backgroundColor: e.target.value }
                          }))}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.configuration.backgroundColor}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            configuration: { ...prev.configuration, backgroundColor: e.target.value }
                          }))}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={formData.configuration.textColor}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            configuration: { ...prev.configuration, textColor: e.target.value }
                          }))}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.configuration.textColor}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            configuration: { ...prev.configuration, textColor: e.target.value }
                          }))}
                          placeholder="#1f2937"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Preview</Label>
                <RichTextEditor 
                  placeholder="This is how your widget will look..." 
                  configuration={formData.configuration}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Widget</Button>
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

      <div className="grid grid-cols-1 gap-6">
        {widgets.map((widget) => (
          <Card key={widget.id} className="hover:shadow-card transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {widget.name}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Workspace: {widget.workspaces?.name} ({widget.workspaces?.domain})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  widget.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {widget.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-muted-foreground">
                  {widget.usage_count} uses
                </span>
              </div>

              <div className="space-y-2">
                <Label>Embed Code</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    {widget.embed_code || 'Generating...'}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyEmbedCode(widget.embed_code)}
                    disabled={!widget.embed_code}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {widgets.length === 0 && !showCreateForm && workspaces.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Code className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No widgets yet</h3>
                <p className="text-muted-foreground">
                  Create your first widget to start embedding editors
                </p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Widget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};