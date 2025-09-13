import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Download, Settings, LogOut, User, DollarSign, HelpCircle, Crown, Shield, Coins, FileText, BookOpen, Lock, Info, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { ModeIndicator } from '@/components/ModeIndicator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Header = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated: authIsAuthenticated, isAdmin, signOut, loading } = useAuth();
  const [demoUser, setDemoUser] = useState<any>(null);
  const [isRunningInApp, setIsRunningInApp] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();

  // Determinar si está autenticado (demo o real)
  const isAuthenticated = authIsAuthenticated() || (localStorage.getItem('demo_authenticated') === 'true');

  useEffect(() => {
    const checkDemoAuth = () => {
      const demoAuth = localStorage.getItem('demo_authenticated');
      const userData = localStorage.getItem('demo_user');
      
      if (demoAuth === 'true' && userData) {
        setDemoUser(JSON.parse(userData));
      } else {
        setDemoUser(null);
      }
    };

    // Detectar si se está ejecutando desde la APK instalada
    const isInWebView = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return userAgent.includes('wv') || 
             userAgent.includes('version/') && userAgent.includes('chrome/') && userAgent.includes('mobile') && !userAgent.includes('browser');
    };
    
    setIsRunningInApp(isInWebView());

    checkDemoAuth();
    // Verificar cambios en localStorage
    window.addEventListener('storage', checkDemoAuth);
    return () => window.removeEventListener('storage', checkDemoAuth);
  }, []);

  // Manejar scroll solo en APK instalada
  useEffect(() => {
    if (!isRunningInApp) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Si está en el top (primeros 50px), minimizar
          if (currentScrollY <= 50) {
            setIsMinimized(true);
            setIsScrolled(false);
          }
          // Si hace scroll hacia abajo, ocultar completamente
          else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsScrolled(true);
            setIsMinimized(false);
          }
          // Si hace scroll hacia arriba, mostrar minimizado
          else if (currentScrollY < lastScrollY) {
            setIsScrolled(false);
            setIsMinimized(true);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRunningInApp]);

  const handleLogout = async () => {
    // Cerrar sesión demo
    localStorage.removeItem('demo_authenticated');
    localStorage.removeItem('demo_user');
    setDemoUser(null);
    
    // Cerrar sesión real si existe
    if (authIsAuthenticated()) {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
    
    navigate('/');
  };
  return (
    <header className={`bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-sm border-b border-pink-300/30 sticky top-0 z-50 transition-all duration-300 ${
      isRunningInApp ? (
        isScrolled ? '-translate-y-full' : 
        isMinimized ? 'py-1' : 'py-0'
      ) : ''
    }`}>
      <div className={`container mx-auto px-4 transition-all duration-300 ${
        isRunningInApp && isMinimized ? 'py-2' : 'py-4'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Heart 
                className="text-primary animate-pulse-glow transition-all duration-300 h-8 w-8 animate-bounce" 
                fill="currentColor"
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute inset-0 animate-float">
                <Heart className="text-primary-glow opacity-70 transition-all duration-300 h-8 w-8 animate-ping" fill="currentColor" />
              </div>
              <div className="absolute inset-0 animate-pulse">
                <Heart className="text-primary opacity-30 transition-all duration-300 h-8 w-8" fill="currentColor" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h1 className={`font-bold bg-love-gradient bg-clip-text text-transparent transition-all duration-300 ${
                isRunningInApp && isMinimized ? 'text-lg' : 'text-2xl'
              }`}>
                ComplicesConecta
              </h1>
              <ModeIndicator />
            </div>
          </Link>

          {/* Navigation - Ocultar en modo minimizado de APK */}
          <nav className={`items-center space-x-6 transition-all duration-300 ${
            isRunningInApp && isMinimized ? 'hidden' : 'hidden md:flex'
          }`}>
            <Link 
              to="/discover" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Descubrir
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/discover" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Perfiles
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/matches" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Matches
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/chat-info" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Chat
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/events" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Eventos
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/about" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Empresa
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link 
              to="/support" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium"
            >
              Soporte
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            
            {/* Dropdown Menu for Info Pages */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-white transition-colors duration-300 relative group font-medium">
                  Información
                  <ChevronDown className="h-4 w-4 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/security" className="flex items-center gap-2 w-full">
                    <Shield className="h-4 w-4" />
                    Seguridad
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tokens" className="flex items-center gap-2 w-full">
                    <Coins className="h-4 w-4" />
                    Tokens CMPX
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/terms" className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    Términos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/guidelines" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Guías
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/privacy" className="flex items-center gap-2 w-full">
                    <Lock className="h-4 w-4" />
                    Privacidad
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/project-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Proyecto
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/chat-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Sistema de Chat
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <Button variant="ghost" size="icon" className="relative text-white hover:text-primary hover:bg-white/10" asChild>
              <Link to="/donations">
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

            {!isAuthenticated ? (
              <Button variant="outline" size="sm" className="bg-white/90 border-white text-black hover:bg-white hover:text-black font-semibold shadow-lg hidden sm:flex" asChild>
                <Link to="/auth" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Iniciar Sesión</span>
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-3">
                <span className="text-white/90 text-xs sm:text-sm hidden sm:inline">
                  {/* Mostrar usuario real o demo */}
                  {user?.email ? (
                    <>
                      {user.email}
                      {isAdmin() && <span className="text-yellow-400 ml-1">(Admin)</span>}
                    </>
                  ) : (
                    <>
                      {demoUser?.name} 
                      {demoUser?.isDemo && <span className="text-primary">(Demo)</span>}
                    </>
                  )}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/90 border-white text-black hover:bg-white hover:text-black font-semibold shadow-lg"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
              </div>
            )}

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