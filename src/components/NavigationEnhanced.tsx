import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, MessageCircle, Heart, User, Settings, UserPlus, Coins, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatures } from '@/hooks/useFeatures';
import { logger } from '@/lib/logger';

interface NavigationEnhancedProps {
  className?: string;
  showNotificationBadges?: boolean;
  enableAnimations?: boolean;
  notificationCounts?: Record<string, number>;
}

const NavigationEnhanced = ({ 
  className, 
  showNotificationBadges = true,
  enableAnimations = true,
  notificationCounts = {}
}: NavigationEnhancedProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { features } = useFeatures();
  
  // Mover hooks al inicio antes de cualquier return
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeItem, setActiveItem] = useState<string>('');

  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('demo_authenticated') === 'true';
  const demoUser = localStorage.getItem('demo_user');

  const baseNavItems = [
    { id: 'feed', icon: Home, label: 'Inicio', path: '/feed' },
    { id: 'discover', icon: Search, label: 'Descubrir', path: '/discover' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
    { id: 'matches', icon: Heart, label: 'Matches', path: '/matches' },
    { id: 'tokens', icon: Coins, label: 'Tokens', path: '/tokens' },
  ];

  // Auto-hide navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
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
  }, [lastScrollY]);

  // Agregar solicitudes si la función está habilitada
  const navItems = features.requests 
    ? [
        ...baseNavItems.slice(0, 3), // feed, discover, chat
        { id: 'requests', icon: UserPlus, label: 'Solicitudes', path: '/requests' },
        ...baseNavItems.slice(3), // matches
        { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
        { id: 'settings', icon: Settings, label: 'Configuración', path: '/edit-profile-single' },
      ]
    : [
        ...baseNavItems,
        { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
        { id: 'settings', icon: Settings, label: 'Configuración', path: '/edit-profile-single' },
      ];

  // Update active item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = navItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [location.pathname, navItems]);

  // Solo mostrar navegación completa si está autenticado
  if (!isAuthenticated || !demoUser) {
    return null; // Ocultar navegación si no está logueado
  }

  const handleLogout = () => {
    localStorage.removeItem('demo_authenticated');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('userType');
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    // Verificar sesión antes de navegar
    const demoUser = localStorage.getItem('demo_user');
    const userType = localStorage.getItem('userType');
    const isDemo = localStorage.getItem('demo_authenticated') === 'true';
    
    logger.info('🔍 Navigation Debug:', { demoUser, userType, isDemo, path });
    
    // Detectar tipo de usuario y redirigir al perfil correcto
    if (path === '/profile') {
      if (userType === 'couple') {
        navigate('/profile-couple');
      } else {
        navigate('/profile-single');
      }
      return;
    }
    
    // Verificar autenticación antes de navegar
    const isAuthenticated = isDemo;
    if (demoUser) {
    }
    
    if (!isAuthenticated) {
      logger.info('❌ Usuario no autenticado, redirigiendo a /auth');
      navigate('/auth');
      return;
    }
    
    // Navegar a la ruta solicitada
    navigate(path);
  };

  // Animation variants
  const navVariants = {
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
    <motion.nav 
      variants={enableAnimations ? navVariants : undefined}
      initial={enableAnimations ? "hidden" : undefined}
      animate={enableAnimations ? (isVisible ? "visible" : "hidden") : undefined}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white/10 backdrop-blur-2xl border-t border-white/20",
        "shadow-[0_-8px_32px_rgba(0,0,0,0.1)]",
        "px-2 sm:px-4 py-2 safe-area-pb",
        !enableAnimations && (isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"),
        !enableAnimations && "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-t-2xl" />
      
      <div className="relative flex items-center justify-between w-full max-w-full mx-auto px-1 overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-around w-full min-w-fit gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const notificationCount = notificationCounts[item.id] || 0;
            const hasNotifications = showNotificationBadges && notificationCount > 0;
            
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
                    ? "text-white" 
                    : "text-gray-600 hover:text-gray-800"
                )}
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
                isActive ? "text-white font-semibold" : "text-gray-600 group-hover:text-gray-800"
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
            "text-red-400 hover:text-red-300 hover:bg-red-500/20"
          )}
          whileHover={enableAnimations ? { scale: 1.05 } : undefined}
          whileTap={enableAnimations ? { scale: 0.95 } : undefined}
        >
          <LogOut 
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 transition-all duration-300 relative z-10",
              "group-hover:scale-110 group-hover:drop-shadow-md"
            )} 
          />
          <span className={cn(
            "text-[10px] sm:text-xs font-medium transition-all duration-300 truncate max-w-[45px] sm:max-w-none relative z-10",
            "text-red-400/80 group-hover:text-red-300"
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
  );
};

export default NavigationEnhanced;
