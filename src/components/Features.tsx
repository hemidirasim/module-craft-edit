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
  Eye,
  Shield,
  Rocket,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built from scratch with performance in mind. No bloated third-party dependencies.",
    gradient: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-500/10 to-orange-500/10"
  },
  {
    icon: Blocks,
    title: "Modular Architecture",
    description: "Each feature is a separate module. Enable only what you need for optimal performance.",
    gradient: "from-blue-400 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10"
  },
  {
    icon: Palette,
    title: "Full Customization",
    description: "Complete control over styling, behavior, and functionality. Make it truly yours.",
    gradient: "from-purple-400 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Clean APIs, comprehensive documentation, and easy integration with any framework.",
    gradient: "from-green-400 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10"
  },
  {
    icon: Image,
    title: "Rich Media Support",
    description: "Images, videos, audio, and advanced image editing tools built right in.",
    gradient: "from-pink-400 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10"
  },
  {
    icon: FileText,
    title: "Export Anywhere",
    description: "Export to PDF, Word, HTML, or JSON. Your content, your format.",
    gradient: "from-indigo-400 to-purple-500",
    bgGradient: "from-indigo-500/10 to-purple-500/10"
  },
  {
    icon: Search,
    title: "Search & Replace",
    description: "Powerful search and replace functionality with regex support.",
    gradient: "from-teal-400 to-cyan-500",
    bgGradient: "from-teal-500/10 to-cyan-500/10"
  },
  {
    icon: Download,
    title: "One-Click Embed",
    description: "Generate embed codes instantly. Deploy anywhere with a single script tag.",
    gradient: "from-violet-400 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10"
  },
  {
    icon: Scissors,
    title: "Image Editing",
    description: "Crop, resize, rotate, and flip images directly in the editor.",
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10"
  },
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See exactly how your editor will look and behave before deployment.",
    gradient: "from-sky-400 to-blue-500",
    bgGradient: "from-sky-500/10 to-blue-500/10"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption and GDPR compliance.",
    gradient: "from-emerald-400 to-green-500",
    bgGradient: "from-emerald-500/10 to-green-500/10"
  },
  {
    icon: Rocket,
    title: "Auto Scaling",
    description: "Handles millions of users with automatic scaling and load balancing.",
    gradient: "from-red-400 to-pink-500",
    bgGradient: "from-red-500/10 to-pink-500/10"
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Powerful Features
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Everything You Need
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Built-In</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From basic formatting to advanced image editing, our modular system 
            gives you complete control over every aspect of your rich text editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <span>Explore All Features</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  );
};