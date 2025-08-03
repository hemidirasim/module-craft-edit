import { useState } from "react";
import { RichTextEditor } from "./editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Code, Eye } from "lucide-react";

export const Demo = () => {
  const [editorContent, setEditorContent] = useState(`
    <h2>Welcome to EditorCraft!</h2>
    <p>This is a <strong>live demo</strong> of our custom rich text editor. Try out the formatting tools above:</p>
    <ul>
      <li><em>Italic text</em> formatting</li>
      <li><u>Underlined text</u> for emphasis</li>
      <li><s>Strikethrough</s> for corrections</li>
    </ul>
    <p>You can also insert <a href="#">links</a> and images. This editor is built from scratch with <strong>zero third-party dependencies</strong>.</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <img src="/lovable-uploads/d658b038-a3c1-4426-8485-f456baddff8b.png" alt="Sample image for testing" style="max-width: 300px; height: auto;" />
      <p><em>Click on the image above to test the crop and editing features!</em></p>
    </div>
    
    <blockquote>
      <p>"The best way to predict the future is to invent it." - Alan Kay</p>
    </blockquote>
  `);
  
  const [viewMode, setViewMode] = useState<"editor" | "code" | "preview">("editor");

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Try It
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Live</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the power of our modular rich text editor. 
            Every feature you see here is built from scratch.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* View Mode Tabs */}
          <div className="flex gap-2 mb-6 justify-center">
            <Button
              variant={viewMode === "editor" ? "hero" : "outline"}
              size="sm"
              onClick={() => setViewMode("editor")}
              className="flex items-center gap-2"
            >
              <Play size={16} />
              Live Editor
            </Button>
            <Button
              variant={viewMode === "code" ? "hero" : "outline"}
              size="sm"
              onClick={() => setViewMode("code")}
              className="flex items-center gap-2"
            >
              <Code size={16} />
              HTML Output
            </Button>
            <Button
              variant={viewMode === "preview" ? "hero" : "outline"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              Preview
            </Button>
          </div>

          {/* Editor */}
          {viewMode === "editor" && (
            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholder="Start typing to see the magic happen..."
            />
          )}

          {/* Code View */}
          {viewMode === "code" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">HTML Output:</h3>
              <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{editorContent}</code>
              </pre>
            </Card>
          )}

          {/* Preview */}
          {viewMode === "preview" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Rendered Preview:</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            </Card>
          )}

          {/* Feature Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Clean HTML Output</h3>
              <p className="text-sm text-muted-foreground">
                Generates semantic, clean HTML without any bloated markup.
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                See changes instantly as you type and format content.
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">WYSIWYG Preview</h3>
              <p className="text-sm text-muted-foreground">
                What you see is exactly what your users will get.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};