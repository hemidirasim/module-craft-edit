import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, Star, Zap, Users } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8 hover:bg-white/15 transition-all duration-300 group">
          <Sparkles size={16} className="animate-pulse" />
          <span>Next Generation Rich Text Editor</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Craft
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Amazing Content
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
          Build powerful, customizable rich text editors with zero dependencies. 
          <span className="text-purple-300 font-semibold"> Deploy in minutes</span>, 
          <span className="text-blue-300 font-semibold"> scale infinitely</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button 
            className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 group"
          >
            <Zap className="mr-2" size={20} />
            Start Building Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-10 py-6 h-auto border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 group"
          >
            <Play className="mr-2" size={20} />
            Watch Demo
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12">
          <div className="flex items-center gap-2 text-white/60">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm">Trusted by 10,000+ developers</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-current" />
            ))}
            <span className="text-white/60 text-sm ml-2">4.9/5 rating</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">100+</div>
            <div className="text-white/60 text-sm">Free Credits</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">0</div>
            <div className="text-white/60 text-sm">Dependencies</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">∞</div>
            <div className="text-white/60 text-sm">Possibilities</div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-20 right-10 w-3 h-3 bg-blue-400 rounded-full animate-ping delay-500"></div>
      <div className="absolute top-1/2 right-20 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-1000"></div>
    </div>
  );
};