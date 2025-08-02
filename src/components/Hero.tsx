import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8">
          <Sparkles size={16} />
          <span>Build custom rich text editors in minutes</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          Create Custom
          <br />
          <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Rich Text Editors
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
          Build and embed powerful, modular rich text editors without any third-party dependencies. 
          Configure, customize, and deploy in minutes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="glass" 
            size="lg"
            className="text-lg px-8 py-4 h-auto"
          >
            Start Building Free
            <ArrowRight className="ml-2" size={20} />
          </Button>
          <Button 
            variant="ghost" 
            size="lg"
            className="text-white hover:bg-white/10 text-lg px-8 py-4 h-auto"
          >
            View Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16 text-white/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">100+</div>
            <div className="text-sm">Free Credits</div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-sm">Third-party Dependencies</div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm">Customization Options</div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-500"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white/5 rounded-full animate-pulse delay-1000"></div>
    </div>
  );
};