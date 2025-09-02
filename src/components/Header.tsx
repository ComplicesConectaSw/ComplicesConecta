import { Heart, User, HelpCircle, Settings, Crown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-sm border-b border-pink-300/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-primary animate-pulse-glow" fill="currentColor" />
              <div className="absolute inset-0 animate-float">
                <Heart className="h-8 w-8 text-primary-glow opacity-50" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-love-gradient bg-clip-text text-transparent">
              ComplicesConecta
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/discover" 
              className="text-white/90 hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Descubrir
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/profiles" 
              className="text-white/90 hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Perfiles
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/matches" 
              className="text-white/90 hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Matches
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/chat" 
              className="text-white/90 hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Chat
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/events" 
              className="text-white/90 hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Eventos
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative text-white hover:text-primary hover:bg-white/10" asChild>
              <Link to="/support">
                <DollarSign className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  ❤️
                </span>
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="relative text-white hover:text-primary hover:bg-white/10" asChild>
              <Link to="/faq">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10" asChild>
              <Link to="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="outline" size="sm" className="bg-white/90 border-white text-black hover:bg-white hover:text-black font-semibold shadow-lg" asChild>
              <Link to="/discover" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Iniciar Sesión
              </Link>
            </Button>

            <Button variant="love" size="sm" asChild>
              <Link to="/premium" className="flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Premium
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};