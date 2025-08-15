import { useState, useEffect } from "react";
import { RichTextEditor } from "./editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Code, Eye, Zap, Sparkles, ArrowRight } from "lucide-react";
import { getOrCreateDemoSession } from "@/utils/prismaDemoUtils";

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

  // Arxa fonda demo session yarat
  useEffect(() => {
    const initDemoSession = async () => {
      try {
        await getOrCreateDemoSession();
      } catch (error) {
        console.error('Demo session initialization error:', error);
      }
    };
    
    initDemoSession();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <Sparkles size={16} className="animate-pulse" />
            Interactive Demo
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Try It
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Live</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the power of our modular rich text editor. 
            Every feature you see here is built from scratch with zero dependencies.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* View Mode Tabs */}
          <div className="flex gap-3 mb-8 justify-center">
            <Button
              variant={viewMode === "editor" ? "default" : "outline"}
              size="lg"
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-2 px-6 py-3 ${
                viewMode === "editor" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                  : "hover:bg-gray-50"
              }`}
            >
              <Play size={18} />
              Live Editor
            </Button>
            <Button
              variant={viewMode === "code" ? "default" : "outline"}
              size="lg"
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-2 px-6 py-3 ${
                viewMode === "code" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                  : "hover:bg-gray-50"
              }`}
            >
              <Code size={18} />
              HTML Output
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "outline"}
              size="lg"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-2 px-6 py-3 ${
                viewMode === "preview" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                  : "hover:bg-gray-50"
              }`}
            >
              <Eye size={18} />
              Preview
            </Button>
          </div>

          {/* Editor Container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Editor */}
            {viewMode === "editor" && (
              <div className="p-8">
                <RichTextEditor
                  content={editorContent}
                  onChange={setEditorContent}
                  placeholder="Start typing to see the magic happen..."
                />
              </div>
            )}

            {/* Code View */}
            {viewMode === "code" && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">HTML Output:</h3>
                  <Button variant="outline" size="sm" className="text-xs">
                    Copy Code
                  </Button>
                </div>
                <div className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto">
                  <pre className="text-sm leading-relaxed">
                    <code>{editorContent}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Preview */}
            {viewMode === "preview" && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Rendered Preview:</h3>
                <div 
                  className="prose prose-lg max-w-none bg-gray-50 p-8 rounded-xl"
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              </div>
            )}
          </div>

          {/* Feature Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Clean HTML Output</h3>
              <p className="text-gray-600 leading-relaxed">
                Generates semantic, clean HTML without any bloated markup or unnecessary classes.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Real-time Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                See changes instantly as you type and format content with zero lag or delay.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">WYSIWYG Preview</h3>
              <p className="text-gray-600 leading-relaxed">
                What you see is exactly what your users will get. No surprises, no hidden formatting.
              </p>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h3>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who are already using EditorCraft to create powerful content experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start Building Free
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
                  >
                    View Documentation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};