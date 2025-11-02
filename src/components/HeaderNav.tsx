import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  User, 
  MessageSquare, 
  Calendar, 
  Users, 
  Building2, 
  Shield, 
  HelpCircle, 
  Info,
  DollarSign,
  Settings,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface HeaderNavProps {
  className?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: _user, isAuthenticated: _isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para efecto de transparencia
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Descubrir', path: '/discover', icon: Search },
    { name: 'Perfiles', path: '/profiles', icon: User },
    { name: 'Matches', path: '/matches', icon: Heart },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Eventos', path: '/events', icon: Calendar },
    { name: 'Stories', path: '/stories', icon: Users },
    { name: 'Empresa', path: '/about', icon: Building2 },
    { name: 'Moderadores', path: '/moderators', icon: Shield },
    { name: 'Soporte', path: '/support', icon: HelpCircle },
    { name: 'Información', path: '/info', icon: Info }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    logger.info('Navigation:', { path });
    
    // Analytics tracking for navigation
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'navigation', {
        event_category: 'header_nav',
        event_label: path,
        value: 1
      });
    }
  };

  const handleLogin = () => {
    navigate('/auth');
    logger.info('Login initiated');
    
    // Analytics tracking for login click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'login_click', {
        event_category: 'authentication',
        event_label: 'header_login',
        value: 1
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Header Principal */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gradient-to-r from-purple-950/95 via-purple-900/95 to-purple-950/95 backdrop-blur-md border-b border-purple-500/30' 
          : 'bg-gradient-to-r from-purple-950/98 via-purple-900/98 to-purple-950/98 backdrop-blur-sm border-b border-purple-400/40'
      } ${className}`}>
        
        {/* Contenedor Principal */}
        <div className="w-full">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            
            {/* Logo - Izquierda */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => handleNavigation('/')}
                className="flex items-center space-x-3 group transition-all duration-300 hover:scale-110"
              >
                <div className="relative">
                  <Heart className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="currentColor" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-white font-black text-xl lg:text-2xl hidden sm:block bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  ComplicesConecta
                </span>
              </button>
            </div>

            {/* Navegación Central - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl mx-8">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Acciones de Usuario - Derecha */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              
              {/* Iconos de Acción */}
              <div className="hidden md:flex items-center space-x-1">
                <button className="p-2 text-white/70 hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300">
                  <DollarSign className="h-5 w-5" />
                </button>
                <button className="p-2 text-white/70 hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300">
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button className="p-2 text-white/70 hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="relative p-2 text-white/70 hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 bg-pink-500 text-white text-xs flex items-center justify-center">
                    3
                  </Badge>
                </button>
              </div>

              {/* Botón de Login */}
              <Button
                onClick={handleLogin}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-110 min-w-[140px] border-2 border-purple-400"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline text-base">Iniciar Sesión</span>
                <span className="sm:hidden text-sm">Login</span>
              </Button>

              {/* Botón Menú Móvil */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-white hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gradient-to-r from-purple-900/95 via-purple-900/95 to-blue-900/95 backdrop-blur-md border-t border-purple-500/20">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
              
              {/* Acciones Móviles */}
              <div className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center space-x-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    <DollarSign className="h-5 w-5" />
                    <span>Tokens</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    <Settings className="h-5 w-5" />
                    <span>Config</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Espaciador para contenido */}
      <div className="h-16"></div>
    </>
  );
};

export default HeaderNav;