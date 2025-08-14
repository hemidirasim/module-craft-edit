import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Edit3, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                EditorCraft
              </span>
              <span className="text-xs text-gray-500 -mt-1">Pro</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <div className="relative group">
              <a href="#features" className="flex items-center gap-1 text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Features
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </a>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="p-4 space-y-2">
                  <a href="#editor" className="block px-3 py-2 text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Rich Text Editor</a>
                  <a href="#media" className="block px-3 py-2 text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Media Handling</a>
                  <a href="#export" className="block px-3 py-2 text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Export Options</a>
                </div>
              </div>
            </div>
            <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Pricing
            </a>
            <a href="#docs" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Documentation
            </a>
            <a href="#demo" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Demo
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/dashboard'}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/auth'}
                  className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <nav className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4">Features</div>
                <a href="#editor" className="block px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Rich Text Editor</a>
                <a href="#media" className="block px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Media Handling</a>
                <a href="#export" className="block px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Export Options</a>
              </div>
              <div className="border-t border-gray-200/50 pt-4 space-y-2">
                <a href="#pricing" className="block px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Pricing
                </a>
                <a href="#docs" className="block px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Documentation
                </a>
                <a href="#demo" className="block px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Demo
                </a>
              </div>
              <div className="border-t border-gray-200/50 pt-4 space-y-3">
                {user ? (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-700 hover:text-purple-600 hover:bg-purple-50" 
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-700 hover:text-purple-600 hover:bg-purple-50" 
                      onClick={() => window.location.href = '/auth'}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Get Started Free
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};