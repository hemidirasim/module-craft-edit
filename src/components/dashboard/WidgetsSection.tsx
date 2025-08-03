import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Plus, Code, Copy, Eye, Settings, Edit, Trash2 } from 'lucide-react';
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
  const [previewContent, setPreviewContent] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
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
        enableAlignment: true,
        enableFont: false,
        enableColor: false,
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
          enableAlignment: true,
          enableFont: false,
          enableColor: false,
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

  const startEdit = (widget: Widget) => {
    setEditingWidget(widget);
    setFormData({
      name: widget.name,
      workspace_id: widget.workspace_id,
      configuration: widget.configuration
    });
  };

  const updateWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWidget) return;

    try {
      const { error } = await (supabase as any)
        .from('editor_widgets')
        .update({
          name: formData.name,
          workspace_id: formData.workspace_id,
          configuration: formData.configuration
        })
        .eq('id', editingWidget.id);

      if (error) throw error;

      toast({
        title: "Widget updated!",
        description: "Your widget has been successfully updated.",
      });

      setEditingWidget(null);
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
          enableAlignment: true,
          enableFont: false,
          enableColor: false,
          fontFamily: 'Inter',
          fontSize: '14px',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
        }
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to update widget",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteWidget = async (widget: Widget) => {
    if (!confirm(`Are you sure you want to delete "${widget.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('editor_widgets')
        .delete()
        .eq('id', widget.id);

      if (error) throw error;

      toast({
        title: "Widget deleted!",
        description: "Your widget has been removed.",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to delete widget",
        description: error.message,
        variant: "destructive",
      });
    }
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

      {(showCreateForm || editingWidget) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingWidget ? 'Edit Widget' : 'Create New Widget'}</CardTitle>
            <CardDescription>
              Configure your custom rich text editor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingWidget ? updateWidget : createWidget} className="space-y-6">
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
                         {key === 'enableFont' ? 'Font' :
                          key === 'enableColor' ? 'Color' :
                          key === 'enableAlignment' ? 'Alignment' :
                          key.replace('enable', '')}
                       </Label>
                    </div>
                  ))}
                </div>
              </div>


              <div className="space-y-2">
                <Label>Preview</Label>
                <RichTextEditor 
                  placeholder="This is how your widget will look..." 
                  configuration={formData.configuration}
                  content={previewContent}
                  onChange={setPreviewContent}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingWidget ? 'Update Widget' : 'Create Widget'}</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingWidget(null);
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
                        enableAlignment: true,
                        enableFont: false,
                        enableColor: false,
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        textColor: '#1f2937',
                      }
                    });
                  }}
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => startEdit(widget)}
                    title="Edit widget"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteWidget(widget)}
                    title="Delete widget"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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