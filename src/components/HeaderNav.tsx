import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  User, 
  MessageSquare, 
  Calendar, 
  Building2, 
  Shield, 
  HelpCircle, 
  Info,
  DollarSign,
  Settings,
  Bell,
  Menu,
  X,
  ShoppingBag,
  FileText,
  Lock,
  Crown,
  ChevronDown,
  MoreHorizontal,
  Scale,
  Image
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface HeaderNavProps {
  className?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
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

  // Items principales - siempre visibles
  const mainNavItems = [
    { name: 'Inicio', path: '/', icon: Heart },
    { name: 'Descubrir', path: '/discover', icon: Search },
    { name: 'Matches', path: '/matches', icon: Heart },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Noticias', path: '/news', icon: Bell },
    { name: 'Eventos', path: '/events', icon: Calendar },
    { name: 'Tokens', path: '/tokens', icon: DollarSign },
    { name: 'NFTs', path: '/nfts', icon: Image }
  ];

  // Items secundarios - en menú desplegable
  const secondaryNavItems = [
    { name: 'Perfiles', path: '/profiles', icon: User, category: 'Comunidad' },
    // Feed removido: tiene su propio navegador y es exclusivo para perfiles demo/producción
    { name: 'Premium', path: '/premium', icon: Crown, category: 'Servicios' },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag, category: 'Servicios' },
    { name: 'Blog', path: '/blog', icon: FileText, category: 'Contenido' },
    { name: 'Noticias', path: '/news', icon: Bell, category: 'Contenido' },
    { name: 'Inversores', path: '/investors', icon: DollarSign, category: 'Acerca de' },
    { name: 'Empresa', path: '/about', icon: Building2, category: 'Acerca de' },
    { name: 'Carreras', path: '/careers', icon: Building2, category: 'Acerca de' },
    { name: 'Donaciones', path: '/donations', icon: DollarSign, category: 'Acerca de' },
    { name: 'FAQ', path: '/faq', icon: HelpCircle, category: 'Ayuda' },
    { name: 'Información', path: '/info', icon: Info, category: 'Ayuda' },
    { name: 'Soporte', path: '/support', icon: HelpCircle, category: 'Ayuda' },
    { name: 'Términos', path: '/terms', icon: FileText, category: 'Legal' },
    { name: 'Privacidad', path: '/privacy', icon: Lock, category: 'Legal' },
    { name: 'Seguridad', path: '/security', icon: Shield, category: 'Legal' },
    { name: 'Proyecto', path: '/project-info', icon: FileText, category: 'Legal' },
    // Documentación interna de tokens - Solo para usuarios autenticados
    ...(isAuthenticated() ? [
      { name: 'Tokens - Términos', path: '/tokens-terms', icon: FileText, category: 'Legal' },
      { name: 'Tokens - Privacidad', path: '/tokens-privacy', icon: Lock, category: 'Legal' },
      { name: 'Tokens - Legal', path: '/tokens-legal', icon: Scale, category: 'Legal' }
    ] : [])
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
      {/* Header Principal con gradiente difuminado */}
      <header className={`header-nav-main fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gradient-to-b from-purple-900/90 via-purple-800/85 to-transparent backdrop-blur-md border-b border-purple-500/20' 
          : 'bg-gradient-to-b from-purple-900/95 via-purple-800/90 to-purple-700/80 backdrop-blur-sm border-b border-purple-400/30'
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
                <div className="relative animate-heart-float">
                  <Heart 
                    className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 animate-heart-beat" 
                    fill="currentColor" 
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))',
                      animation: 'heartBeat 1.5s ease-in-out infinite, heartGlow 2s ease-in-out infinite'
                    }}
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></div>
                  {/* Partículas flotantes */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-1 h-1 bg-purple-300 rounded-full animate-particle-1"></div>
                    <div className="absolute top-1 right-0 w-1 h-1 bg-blue-300 rounded-full animate-particle-2"></div>
                    <div className="absolute bottom-0 left-1 w-1 h-1 bg-purple-400 rounded-full animate-particle-3"></div>
                  </div>
                </div>
                <span className="text-white font-black text-xl lg:text-2xl hidden sm:block bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent animate-gradient-x">
                  ComplicesConecta
                </span>
              </button>
            </div>

            {/* Navegación Central - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-1 justify-center mx-4 xl:mx-8 overflow-x-auto scrollbar-hide">
              {mainNavItems.slice(0, 4).map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-1 xl:space-x-2 px-2 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap hidden xl:inline">{item.name}</span>
                  </button>
                );
              })}
              
              {/* Menú desplegable "Más" */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-1 xl:space-x-2 px-2 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Más</span>
                    <ChevronDown className="h-3 w-3 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 sm:w-64 bg-purple-900/95 border-purple-500/30 backdrop-blur-md max-h-[80vh] overflow-y-auto z-[200] custom-scrollbar"
                  align="end"
                  sideOffset={5}
                >
                  <div className="max-h-[calc(80vh-2rem)] overflow-y-auto overscroll-contain custom-scrollbar-inner">
                    {['Comunidad', 'Servicios', 'Contenido', 'Acerca de', 'Ayuda', 'Legal'].map((category) => {
                      const categoryItems = secondaryNavItems.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <DropdownMenuLabel className="text-purple-300 text-xs font-semibold px-2 py-1.5 sticky top-0 bg-purple-900/95 z-10">
                            {category}
                          </DropdownMenuLabel>
                          {categoryItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <DropdownMenuItem
                                key={item.name}
                                onClick={() => handleNavigation(item.path)}
                                className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer px-2 py-2"
                              >
                                <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{item.name}</span>
                              </DropdownMenuItem>
                            );
                          })}
                          <DropdownMenuSeparator className="bg-purple-500/20 my-1" />
                        </div>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Acciones de Usuario - Derecha */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              
              {/* Iconos de Acción */}
              <div className="hidden md:flex items-center space-x-1">
                <button 
                  onClick={() => {
                    handleNavigation('/tokens');
                    logger.info('Tokens icon clicked');
                  }}
                  className="p-2 text-white/70 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all duration-300"
                  title="Tokens"
                >
                  <DollarSign className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => {
                    handleNavigation('/faq');
                    logger.info('Help icon clicked');
                  }}
                  className="p-2 text-white/70 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all duration-300"
                  title="Ayuda"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => {
                    if (isAuthenticated()) {
                      handleNavigation('/settings');
                    } else {
                      handleNavigation('/info');
                    }
                    logger.info('Settings icon clicked');
                  }}
                  className="p-2 text-white/70 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all duration-300"
                  title="Configuración"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => {
                    if (isAuthenticated()) {
                      // TODO: Abrir NotificationCenter dropdown o navegar a página de notificaciones
                      handleNavigation('/notifications');
                    } else {
                      handleNavigation('/news');
                    }
                    logger.info('Notifications icon clicked');
                  }}
                  className="relative p-2 text-white/70 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all duration-300"
                  title="Notificaciones"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-purple-500 text-white text-xs flex items-center justify-center rounded-full shadow-lg border-2 border-purple-600 z-10">
                    3
                  </Badge>
                </button>
              </div>

              {/* Botón de Login/Perfil - Muestra estado de autenticación */}
              {isAuthenticated() ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-3 sm:px-6 py-2 sm:py-3 rounded-xl shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-105 sm:hover:scale-110 min-w-[100px] sm:min-w-[140px] border-2 border-purple-400 flex items-center justify-center"
                    >
                      <User className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline text-sm sm:text-base truncate max-w-[120px]">
                        {user?.email?.split('@')[0] || 'Perfil'}
                      </span>
                      <span className="sm:hidden text-xs">Perfil</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-purple-900/95 backdrop-blur-xl border-purple-500/30 text-white w-56">
                    <DropdownMenuLabel className="text-white font-semibold">
                      {user?.email || 'Usuario'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-purple-500/30" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="text-white hover:bg-purple-700/50 cursor-pointer"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="text-white hover:bg-purple-700/50 cursor-pointer"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-purple-500/30" />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await signOut();
                        navigate('/auth', { replace: true });
                      }}
                      className="text-red-300 hover:bg-red-900/50 cursor-pointer"
                    >
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-3 sm:px-6 py-2 sm:py-3 rounded-xl shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-105 sm:hover:scale-110 min-w-[100px] sm:min-w-[140px] border-2 border-purple-400 flex items-center justify-center"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm sm:text-base">Iniciar Sesión</span>
                  <span className="sm:hidden text-xs">Login</span>
                </Button>
              )}

              {/* Botón Menú Móvil */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-white hover:text-purple-400 hover:bg-white/10 rounded-lg transition-all duration-300"
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
              {/* Items principales */}
              {mainNavItems.map((item) => {
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
              
              {/* Separador */}
              <div className="border-t border-white/10 my-4"></div>
              
              {/* Items secundarios */}
              {secondaryNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </button>
                );
              })}
              
              {/* Acciones Móviles */}
              <div className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleNavigation('/tokens')}
                    className="flex items-center space-x-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Tokens</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (isAuthenticated()) {
                        handleNavigation('/settings');
                      } else {
                        handleNavigation('/info');
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
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
      
      {/* Animaciones personalizadas del corazón */}
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(1.1); }
          20%, 40% { transform: scale(1.05); }
        }
        
        @keyframes heartGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.6)); 
          }
          50% { 
            filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.9)) 
                    drop-shadow(0 0 30px rgba(236, 72, 153, 0.5)); 
          }
        }
        
        @keyframes heartFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        .animate-heart-float {
          animation: heartFloat 3s ease-in-out infinite;
        }
        
        @keyframes particle-1 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(-10px, -15px) scale(1); opacity: 0; }
        }
        
        @keyframes particle-2 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(10px, -20px) scale(1); opacity: 0; }
        }
        
        @keyframes particle-3 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(-5px, 15px) scale(1); opacity: 0; }
        }
        
        .animate-particle-1 {
          animation: particle-1 2s ease-in-out infinite;
        }
        
        .animate-particle-2 {
          animation: particle-2 2.5s ease-in-out infinite 0.5s;
        }
        
        .animate-particle-3 {
          animation: particle-3 3s ease-in-out infinite 1s;
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default HeaderNav;