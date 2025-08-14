import { Edit3, Github, Twitter, Linkedin, Mail, MessageCircle, ArrowRight, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Edit3 className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  EditorCraft
                </span>
                <span className="text-xs text-gray-400 -mt-1">Pro</span>
              </div>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed max-w-md">
              Build custom rich text editors without third-party dependencies. 
              Modular, fast, and completely customizable for modern web applications.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-white">Stay updated</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Product</h3>
            <ul className="space-y-4 text-gray-300">
              <li><a href="#features" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Features
              </a></li>
              <li><a href="#pricing" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Pricing
              </a></li>
              <li><a href="#demo" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Demo
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Roadmap
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Changelog
              </a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Resources</h3>
            <ul className="space-y-4 text-gray-300">
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Documentation
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                API Reference
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Examples
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Community
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Support
              </a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
            <ul className="space-y-4 text-gray-300">
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                About
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Blog
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Careers
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Contact
              </a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Press Kit
              </a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 text-gray-400 mb-4 md:mb-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>by the EditorCraft team</span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">GDPR</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            © 2024 EditorCraft. All rights reserved. | Built with modern web technologies
          </p>
        </div>
      </div>
    </footer>
  );
};