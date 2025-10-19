import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MessageCircle,
  Heart,
  Search,
  Calendar,
  Settings,
  User,
  UserPlus,
  Coins,
  LogOut
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface _NavigationEnhancedProps {
  className?: string;
  showNotificationBadges?: boolean;
  enableAnimations?: boolean;
  notificationCounts?: Record<string, number>;
}

const NavigationEnhanced: React.FC = () => {
  const [_activeItem, setActiveItem] = useState('feed');
  const [_isVisible, setIsVisible] = useState(true);
  const [_lastScrollY, setLastScrollY] = useState(0);
  const [_isMobileMenuOpen, _setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, signOut } = useAuth();

  // Configuración de tema y animaciones
  const [navbarStyle] = useState('floating');
  const [demoTheme] = useState('default');
  const [enableAnimations] = useState(true);

  // Forzar re-render cuando cambie el tema
  useEffect(() => {
    // Trigger re-render para aplicar nuevos estilos
    const timer = setTimeout(() => {
      setActiveItem(prev => prev);
    }, 100);
    return () => clearTimeout(timer);
  }, [navbarStyle, demoTheme]);

  // Verificar si el usuario está autenticado (real o demo)
  const isDemoAuthenticated = localStorage.getItem('demo_authenticated') === 'true';
  const _demoUser = localStorage.getItem('demo_user');
  const isRealAuthenticated = isAuthenticated() && user && profile;
  
  // Usuario está autenticado si es demo O real
  const isAuthenticatedUser = isDemoAuthenticated || isRealAuthenticated;

  const baseNavItems = [
    { id: 'feed', icon: Home, label: 'Inicio', path: '/feed' },
    { id: 'discover', icon: Search, label: 'Perfiles', path: '/discover' },
    { id: 'stories', icon: Calendar, label: 'Historias', path: '/stories' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
    { id: 'matches', icon: Heart, label: 'Matches', path: '/matches' },
    { id: 'tokens', icon: Coins, label: 'Tokens', path: '/tokens' },
  ];

  // Auto-hide navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = _lastScrollY;
      
      if (currentScrollY > _lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navigation
        setIsVisible(false);
      } else {
        // Scrolling up - show navigation
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [_lastScrollY]);

  // Agregar solicitudes si la función está habilitada
  const navItems = [
    ...baseNavItems.slice(0, 2), // feed, discover
    { id: 'stories', icon: Calendar, label: 'Momentos', path: '/stories' },
    ...baseNavItems.slice(2), // chat, matches, tokens
    { id: 'requests', icon: UserPlus, label: 'Solicitudes', path: '/requests' },
    { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
    { id: 'settings', icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  // Update active item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = navItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [location.pathname, navItems]);

  // Solo mostrar navegación completa si está autenticado (demo o real)
  if (!isAuthenticatedUser) {
    return null; // Ocultar navegación si no está logueado
  }

  const handleLogout = async () => {
    try {
      if (isRealAuthenticated) {
        // Logout para usuarios reales
        await signOut();
        logger.info('✅ Usuario real deslogueado exitosamente');
      } else {
        // Logout para usuarios demo
        localStorage.removeItem('demo_authenticated');
        localStorage.removeItem('demo_user');
        localStorage.removeItem('userType');
        logger.info('✅ Usuario demo deslogueado exitosamente');
      }
      navigate('/auth');
    } catch (error) {
      logger.error('❌ Error durante logout:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback: limpiar localStorage y redirigir
      localStorage.clear();
      navigate('/auth');
    }
  };

  const handleNavigation = (path: string) => {
    logger.info('🔍 Navigation Debug:', { 
      isRealAuthenticated, 
      isDemoAuthenticated, 
      userType: localStorage.getItem('userType'),
      accountType: profile?.account_type,
      path 
    });
    
    // Detectar tipo de usuario y redirigir al perfil correcto
    if (path === '/profile') {
      let userType = 'single'; // Default
      
      if (isRealAuthenticated && profile) {
        // Usuario real: usar account_type del perfil
        userType = profile.account_type || 'single';
      } else if (isDemoAuthenticated) {
        // Usuario demo: usar userType del localStorage
        userType = localStorage.getItem('userType') || 'single';
      }
      
      if (userType === 'couple') {
        navigate('/profile-couple');
      } else {
        navigate('/profile-single');
      }
      return;
    }
    
    // Verificar autenticación (real o demo)
    if (!isAuthenticatedUser) {
      logger.info('❌ Usuario no autenticado, redirigiendo a /auth');
      navigate('/auth');
      return;
    }
    
    // NAVEGACIÓN SEGURA: Mantener sesión activa al navegar
    logger.info('✅ Navegando con sesión activa:', { path, isAuthenticatedUser: true });
    navigate(path);
  };

  // Animation variants
  const _navVariants = {
    hidden: { 
      y: 100, 
      opacity: 0,
      transition: { duration: 0.3, ease: [0.25, 0.25, 0, 1] }
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: [0.25, 0.25, 0, 1] }
    }
  };

  const itemVariants = {
    inactive: { 
      scale: 1, 
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    active: { 
      scale: 1.1, 
      y: -2,
      transition: { duration: 0.3, ease: [0.25, 0.25, 0, 1] }
    },
    hover: { 
      scale: 1.05, 
      y: -1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: { 
        duration: 1, 
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const backgroundVariants = {
    inactive: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    },
    active: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <AnimatePresence>
      {_isVisible && (
        <motion.nav
          initial={{ y: enableAnimations ? 100 : 0 }}
          animate={{ y: 0 }}
          exit={{ y: enableAnimations ? 100 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe-bottom",
            "bg-white/90 backdrop-blur-xl",
            "shadow-lg shadow-black/20",
            "border-t border-gray-300/70",
            "stable-element"
          )}
          role="navigation"
          aria-label="Navegación principal"
          data-testid="main-navigation"
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-t-2xl" />
          
          <div className="relative flex items-center justify-between w-full max-w-full mx-auto px-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-around w-full min-w-fit gap-1">
              {navItems.map((item, _index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const notificationCount = 0;
                const hasNotifications = false;
                
                return (
                  <motion.button
                    key={item.id}
                    variants={enableAnimations ? itemVariants : undefined}
                    initial={enableAnimations ? "inactive" : undefined}
                    animate={enableAnimations ? (isActive ? "active" : "inactive") : undefined}
                    whileHover={enableAnimations ? "hover" : undefined}
                    whileTap={enableAnimations ? "tap" : undefined}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl",
                      "min-w-[45px] sm:min-w-[55px] w-[45px] sm:w-[55px] min-h-[45px] sm:min-h-[55px] group flex-shrink-0",
                      "transition-all duration-300 ease-out overflow-hidden",
                      !enableAnimations && "transform hover:scale-105",
                      isActive 
                        ? "text-white font-semibold drop-shadow-lg" 
                        : "text-gray-700 hover:text-gray-900 font-medium"
                    )}
                    data-testid={`nav-${item.id}`}
                  >
                  {/* Animated background for active state */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        variants={enableAnimations ? backgroundVariants : undefined}
                        initial={enableAnimations ? "inactive" : undefined}
                        animate={enableAnimations ? "active" : undefined}
                        exit={enableAnimations ? "inactive" : undefined}
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg"
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Hover background */}
                  <div className={cn(
                    "absolute inset-0 bg-gray-100/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    isActive && "group-hover:opacity-20"
                  )} />
                  
                  {/* Icon container */}
                  <div className="relative z-10 flex items-center justify-center">
                    <Icon 
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 transition-all duration-300",
                        isActive ? "drop-shadow-lg" : "group-hover:drop-shadow-md",
                        !enableAnimations && (isActive ? "scale-110" : "group-hover:scale-110")
                      )} 
                    />
                    
                    {/* Notification badge */}
                    <AnimatePresence>
                      {hasNotifications && (
                        <motion.div
                          variants={enableAnimations ? badgeVariants : undefined}
                          initial={enableAnimations ? "hidden" : undefined}
                          animate={enableAnimations ? ["visible", "pulse"] : undefined}
                          exit={enableAnimations ? "hidden" : undefined}
                          className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-white"
                        >
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <span className={cn(
                    "text-[10px] sm:text-xs font-medium transition-all duration-300 truncate max-w-[45px] sm:max-w-none relative z-10",
                    isActive ? "text-white font-semibold drop-shadow-lg" : "text-gray-700 group-hover:text-gray-900 font-medium"
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={enableAnimations ? { scale: 0, opacity: 0 } : undefined}
                        animate={enableAnimations ? { scale: 1, opacity: 1 } : undefined}
                        exit={enableAnimations ? { scale: 0, opacity: 0 } : undefined}
                        transition={enableAnimations ? { delay: 0.1, type: "spring", stiffness: 500 } : undefined}
                        className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-lg"
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
        
        {/* Botón de cerrar sesión */}
        <motion.button
          onClick={handleLogout}
          className={cn(
            "flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl",
            "min-w-[45px] sm:min-w-[55px] w-[45px] sm:w-[55px] min-h-[45px] sm:min-h-[55px] group flex-shrink-0",
            "transition-all duration-300 ease-out transform hover:scale-105",
            "relative overflow-hidden",
            "text-red-600 hover:text-red-700 hover:bg-red-100/50"
          )}
          whileHover={enableAnimations ? { scale: 1.05 } : undefined}
          whileTap={enableAnimations ? { scale: 0.95 } : undefined}
          data-testid="logout-button"
        >
          <LogOut 
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 transition-all duration-300 relative z-10",
              "group-hover:scale-110 group-hover:drop-shadow-md"
            )} 
          />
          <span className={cn(
            "text-[10px] sm:text-xs font-medium transition-all duration-300 truncate max-w-[45px] sm:max-w-none relative z-10",
            "text-red-600 group-hover:text-red-700 font-semibold"
          )}>
            Salir
          </span>
        </motion.button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <motion.div 
        className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full"
        animate={enableAnimations ? { opacity: [0.2, 0.5, 0.2] } : undefined}
        transition={enableAnimations ? { duration: 2, repeat: Infinity } : undefined}
      />
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default NavigationEnhanced;
