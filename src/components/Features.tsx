import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Blocks, 
  Palette, 
  Code, 
  Image, 
  FileText, 
  Search, 
  Download,
  Scissors,
  Eye
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built from scratch with performance in mind. No bloated third-party dependencies."
  },
  {
    icon: Blocks,
    title: "Modular Architecture",
    description: "Each feature is a separate module. Enable only what you need for optimal performance."
  },
  {
    icon: Palette,
    title: "Full Customization",
    description: "Complete control over styling, behavior, and functionality. Make it truly yours."
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Clean APIs, comprehensive documentation, and easy integration with any framework."
  },
  {
    icon: Image,
    title: "Rich Media Support",
    description: "Images, videos, audio, and advanced image editing tools built right in."
  },
  {
    icon: FileText,
    title: "Export Anywhere",
    description: "Export to PDF, Word, HTML, or JSON. Your content, your format."
  },
  {
    icon: Search,
    title: "Search & Replace",
    description: "Powerful search and replace functionality with regex support."
  },
  {
    icon: Download,
    title: "One-Click Embed",
    description: "Generate embed codes instantly. Deploy anywhere with a single script tag."
  },
  {
    icon: Scissors,
    title: "Image Editing",
    description: "Crop, resize, rotate, and flip images directly in the editor."
  },
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See exactly how your editor will look and behave before deployment."
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Built-In</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From basic formatting to advanced image editing, our modular system 
            gives you complete control over every aspect of your rich text editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};