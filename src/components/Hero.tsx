import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, Star, Zap, Users } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-hero-primary/90 to-background flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-hero-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hero-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-hero-accent/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card/10 backdrop-blur-md border border-primary/20 text-foreground text-sm font-medium mb-8 hover:bg-card/15 transition-smooth group shadow-glow">
          <Sparkles size={16} className="animate-pulse text-primary" />
          <span>Next Generation Rich Text Editor</span>
          <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
        </div>

        {/* Main Heading */}
        <h1 className="text-7xl md:text-9xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
            Craft
          </span>
          <br />
          <span className="bg-gradient-hero bg-clip-text text-transparent">
            Amazing Content
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
          Build powerful, customizable rich text editors with zero dependencies. 
          <span className="text-hero-primary font-semibold"> Deploy in minutes</span>, 
          <span className="text-hero-secondary font-semibold"> scale infinitely</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button 
            className="text-lg px-10 py-6 h-auto bg-gradient-primary text-primary-foreground border-0 shadow-elegant hover:shadow-glow transition-smooth transform hover:scale-105 group"
          >
            <Zap className="mr-2" size={20} />
            Start Building Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-10 py-6 h-auto border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm transition-smooth group shadow-card"
          >
            <Play className="mr-2" size={20} />
            Watch Demo
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-hero-primary to-hero-accent rounded-full border-2 border-background"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-hero-secondary to-primary rounded-full border-2 border-background"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-glow to-hero-primary rounded-full border-2 border-background"></div>
            </div>
            <span className="text-sm">Trusted by 10,000+ developers</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-current" />
            ))}
            <span className="text-muted-foreground text-sm ml-2">4.9/5 rating</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-hero-primary transition-colors">100+</div>
            <div className="text-muted-foreground text-sm">Free Credits</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-hero-secondary transition-colors">0</div>
            <div className="text-muted-foreground text-sm">Dependencies</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-hero-accent transition-colors">∞</div>
            <div className="text-muted-foreground text-sm">Possibilities</div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-hero-primary rounded-full animate-ping"></div>
      <div className="absolute bottom-20 right-10 w-3 h-3 bg-hero-secondary rounded-full animate-ping delay-500"></div>
      <div className="absolute top-1/2 right-20 w-2 h-2 bg-hero-accent rounded-full animate-ping delay-1000"></div>
    </div>
  );
};