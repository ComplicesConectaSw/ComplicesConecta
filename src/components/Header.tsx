import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Crown, 
  Settings, 
  HelpCircle, 
  DollarSign, 
  Users, 
  Heart, 
  Coins, 
  FileText, 
  BookOpen, 
  Lock, 
  Info, 
  Shield, 
  ChevronDown, 
  Scale,
  Menu 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useDemoThemeConfig, getNavbarStyles } from '@/hooks/useProfileTheme';
import { ModeIndicator } from '@/components/ModeIndicator';

export const Header = () => {
  const { user, profile, isAuthenticated: authIsAuthenticated, isAdmin, signOut } = useAuth();
  const [demoUser, setDemoUser] = useState<any>(null);
  const [isRunningInApp, setIsRunningInApp] = useState(false);
  const [_isScrolled, setIsScrolled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();

  // Demo theme configuration
  const { navbarStyle } = useDemoThemeConfig();
  const navbarStyles = getNavbarStyles(navbarStyle);

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
    try {
      // Limpiar sesión demo completamente
      localStorage.removeItem('demo_authenticated');
      localStorage.removeItem('demo_user');
      localStorage.removeItem('userType');
      setDemoUser(null);
      
      // Cerrar sesión real si existe
      if (authIsAuthenticated()) {
        await signOut();
      }
      
      // Limpiar cualquier otro dato de sesión
      localStorage.removeItem('selectedProfile');
      localStorage.removeItem('currentUser');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      
      // Forzar recarga de la página para limpiar estado
      window.location.href = '/';
    } catch (error) {
      console.error('Error durante logout:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión",
        variant: "destructive"
      });
    }
  };
  return (
    <header className={`${navbarStyles.backgroundClass} ${navbarStyles.shadowClass} border-b ${navbarStyles.borderClass} sticky top-0 z-50 transition-all duration-300 py-1 sm:py-2 md:py-4`}>
      <div className="container mx-auto px-1 sm:px-2 md:px-4">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
            <div className="relative">
              <Heart 
                className="text-primary transition-all duration-300 h-6 w-6 sm:h-8 sm:w-8 animate-pulse" 
                fill="currentColor"
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute inset-0 animate-float">
                <Heart className="text-primary-glow opacity-70 transition-all duration-300 h-6 w-6 sm:h-8 sm:w-8 animate-ping" fill="currentColor" />
              </div>
              <div className="absolute inset-0 animate-pulse">
                <Heart className="text-primary opacity-30 transition-all duration-300 h-6 w-6 sm:h-8 sm:w-8" fill="currentColor" />
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <h1 className={`font-bold bg-love-gradient bg-clip-text text-transparent transition-all duration-300 stable-element ${
                isRunningInApp && isMinimized ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'
              }`}>
                {isAuthenticated && profile?.nickname ? profile.nickname : 
                 isAuthenticated && demoUser?.displayName ? demoUser.displayName :
                 'ComplicesConecta'}
              </h1>
              <div className="hidden sm:block">
                <ModeIndicator />
              </div>
            </div>
          </Link>

          {/* Notification Bell - Solo para usuarios autenticados */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <NotificationBell />
            </div>
          )}

          {/* Navigation - Ocultar en modo minimizado de APK */}
          <nav className={`items-center space-x-2 lg:space-x-4 transition-all duration-300 ${
            isRunningInApp && isMinimized ? 'hidden' : 'hidden lg:flex'
          }`}>
            {/* Descubrir Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium text-sm lg:text-base bg-transparent border-none p-2">
                  Descubrir
                  <ChevronDown className="h-3 w-3 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/discover" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Descubrir Perfiles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/feed" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Feed
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/blog" className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    Blog
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/news" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Noticias
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Perfiles Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium text-sm lg:text-base bg-transparent border-none p-2">
                  Perfiles
                  <ChevronDown className="h-3 w-3 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/profiles" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Ver Perfiles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/matches" className="flex items-center gap-2 w-full">
                    <Heart className="h-4 w-4" />
                    Matches
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/stories" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Stories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/stories-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Info Stories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Eventos Link */}
            <Link 
              to="/events" 
              className="text-white hover:text-white transition-colors duration-300 relative group font-medium text-sm lg:text-base"
              aria-label="Ver eventos y actividades disponibles"
            >
              Eventos
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>

            {/* Chat Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium text-sm lg:text-base bg-transparent border-none p-2">
                  Chat
                  <ChevronDown className="h-3 w-3 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/chat" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Chat Principal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/chat-authenticated" className="flex items-center gap-2 w-full">
                    <Shield className="h-4 w-4" />
                    Chat Autenticado
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/chat-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Info Chat
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tokens Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium text-sm lg:text-base bg-transparent border-none p-2">
                  Tokens
                  <ChevronDown className="h-3 w-3 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/tokens" className="flex items-center gap-2 w-full">
                    <Coins className="h-4 w-4" />
                    Tokens CMPX
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tokens-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Información
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tokens-privacy" className="flex items-center gap-2 w-full">
                    <Lock className="h-4 w-4" />
                    Privacidad
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Menu Button - Solo visible en mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="lg:hidden text-white hover:text-primary hover:bg-white/10 bg-transparent border-none p-2">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20 w-56 max-h-96 overflow-y-auto">
                {/* Descubrir */}
                <DropdownMenuItem asChild>
                  <Link to="/discover" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Descubrir
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/feed" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Feed
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/blog" className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    Blog
                  </Link>
                </DropdownMenuItem>
                
                {/* Perfiles */}
                <DropdownMenuItem asChild>
                  <Link to="/profiles" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Perfiles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/matches" className="flex items-center gap-2 w-full">
                    <Heart className="h-4 w-4" />
                    Matches
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/stories" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Stories
                  </Link>
                </DropdownMenuItem>
                
                {/* Eventos */}
                <DropdownMenuItem asChild>
                  <Link to="/events" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Eventos
                  </Link>
                </DropdownMenuItem>
                
                {/* Chat */}
                <DropdownMenuItem asChild>
                  <Link to="/chat" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Chat
                  </Link>
                </DropdownMenuItem>
                
                {/* Tokens */}
                <DropdownMenuItem asChild>
                  <Link to="/tokens" className="flex items-center gap-2 w-full">
                    <Coins className="h-4 w-4" />
                    Tokens CMPX
                  </Link>
                </DropdownMenuItem>
                
                {/* Soporte */}
                <DropdownMenuItem asChild>
                  <Link to="/support" className="flex items-center gap-2 w-full">
                    <HelpCircle className="h-4 w-4" />
                    Soporte
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="flex items-center gap-2 w-full">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/guidelines" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Directrices
                  </Link>
                </DropdownMenuItem>
                
                {/* Empresa */}
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Empresa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/project-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Proyecto
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/careers" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Carreras
                  </Link>
                </DropdownMenuItem>
                
                {/* Premium */}
                <DropdownMenuItem asChild>
                  <Link to="/premium" className="flex items-center gap-2 w-full">
                    <Crown className="h-4 w-4" />
                    Premium
                  </Link>
                </DropdownMenuItem>
                
                {/* Configuración */}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                
                {!isAuthenticated && (
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="flex items-center gap-2 w-full">
                      <User className="h-4 w-4" />
                      Iniciar Sesión
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAuthenticated && (
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 w-full text-red-400 hover:text-red-300">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Historias - Acceso directo más prominente */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium text-sm lg:text-base bg-transparent border-none p-2">
                  Historias
                  <ChevronDown className="h-3 w-3 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/stories" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Ver Historias
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/stories-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Información
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Soporte Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium bg-transparent border-none">
                  Soporte
                  <ChevronDown className="h-4 w-4 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/support" className="flex items-center gap-2 w-full">
                    <HelpCircle className="h-4 w-4" />
                    Soporte
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="flex items-center gap-2 w-full">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/guidelines" className="flex items-center gap-2 w-full">
                    <BookOpen className="h-4 w-4" />
                    Directrices
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Empresa Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium bg-transparent border-none">
                  Empresa
                  <ChevronDown className="h-4 w-4 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Acerca de
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/project-info" className="flex items-center gap-2 w-full">
                    <Info className="h-4 w-4" />
                    Proyecto
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/careers" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4" />
                    Carreras
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Legal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white hover:text-white transition-colors duration-300 relative group font-medium bg-transparent border-none">
                  Legal
                  <ChevronDown className="h-4 w-4 ml-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DropdownMenuItem asChild>
                  <Link to="/legal" className="flex items-center gap-2 w-full">
                    <Scale className="h-4 w-4" />
                    Marco Legal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/terms" className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    Términos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/privacy" className="flex items-center gap-2 w-full">
                    <Lock className="h-4 w-4" />
                    Privacidad
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/security" className="flex items-center gap-2 w-full">
                    <Shield className="h-4 w-4" />
                    Seguridad
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="text-white hover:text-primary hover:bg-white/10 hidden sm:flex bg-transparent border-none p-2" asChild>
              <Link to="/donations" aria-label="Donaciones">
                <DollarSign className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  ❤️
                </span>
              </Link>
            </Button>

            <Button className="text-white hover:text-primary hover:bg-white/10 hidden sm:flex bg-transparent border-none p-2" asChild>
              <Link to="/support" aria-label="Soporte">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button className="text-white hover:text-primary hover:bg-white/10 hidden sm:flex bg-transparent border-none p-2" asChild>
              <Link to="/settings" aria-label="Configuración">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              {!isAuthenticated ? (
                <Button
                  asChild
                  className="login-btn auth-button auth-button-mobile bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-3 py-1.5 text-sm font-weight-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Link to="/auth" aria-label="Iniciar sesión en la plataforma">
                    <User className="h-3 w-3 mr-1.5" />
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                    <span className="sm:hidden">Login</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={handleLogout}
                  className="auth-button auth-button-mobile border border-white/30 text-white hover:bg-red-500/30 px-3 py-1.5 text-sm font-weight-bold transition-all duration-300 bg-red-500/20"
                >
                  <LogOut className="h-3 w-3 mr-1.5" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Logout</span>
                </Button>
              )}
            </div>

            {/* Botón Premium - Siempre visible */}
            <Button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700" asChild>
              <Link to="/premium">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Premium</span>
              </Link>
            </Button>

            {/* Notification Bell - v3.1 */}
            {isAuthenticated && <NotificationBell className="hidden sm:block" />}

            {/* Botones de autenticación */}
            {isAuthenticated && (
              <div className="flex items-center gap-1 sm:gap-3">
                <span className="text-white text-xs sm:text-sm hidden sm:inline font-medium">
                  {/* Mostrar usuario real o demo */}
                  {user?.email ? (
                    <>
                      {user.email}
                      {isAdmin() && <span className="text-yellow-300 ml-1 font-bold">(Admin)</span>}
                    </>
                  ) : (
                    <>
                      {demoUser?.name} 
                      {demoUser?.isDemo && <span className="text-pink-300 font-bold">(Demo)</span>}
                    </>
                  )}
                </span>
                <Button 
                  className="bg-red-500 border border-red-500 text-white hover:bg-red-600 hover:border-red-600 hover:text-white font-semibold shadow-lg transition-all duration-300 px-3 py-1.5 text-sm rounded"
                  onClick={handleLogout}
                  aria-label="Cerrar sesión y salir de la plataforma"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs ml-1">Salir</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;