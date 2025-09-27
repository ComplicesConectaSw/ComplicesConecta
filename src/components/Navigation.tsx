import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Heart, User, Settings, Coins, Search, UserPlus, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
// import { NavigationEnhanced } from '@/components/navigation/NavigationEnhanced';
import { logger } from '@/lib/logger';
import { useFeatures } from '@/hooks/useFeatures';
import { usePersistedState } from '@/hooks/usePersistedState';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

// Usar NavigationLegacy temporalmente para el usuario especial
const Navigation = ({ className }: NavigationProps) => {
  // Migrar localStorage a hook tipado
  const [isSpecialUser] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState('demo_user', null);
  
  // Verificar si hay sesión demo activa - FIX CRÍTICO
  const isDemoActive = isSpecialUser === 'true' && demoUser && typeof demoUser === 'object';
  
  // DEBUG: Logs optimizados para evitar bucle infinito
  useEffect(() => {
    logger.info('🔍 Navigation - Estado de autenticación:', {
      isSpecialUser,
      demoUser: !!demoUser,
      demoUserType: typeof demoUser,
      isDemoActive
    });
  }, [isSpecialUser, demoUser, isDemoActive]);
  
  if (isDemoActive) {
    return <NavigationLegacy className={className} />;
  }
  
  // Fallback temporal - solo mostrar NavigationLegacy
  return <NavigationLegacy className={className} />;
};

// Export del componente original para casos específicos
export const NavigationLegacy = ({ className }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { features } = useFeatures();
  
  // Navegación siempre visible - sin efectos de scroll
  const [isVisible] = useState(true);

  // localStorage migrado a hooks tipados - todos los hooks al inicio
  const [isDemoAuthenticated] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState('demo_user', null);
  const [currentUserType] = usePersistedState('userType', null);
  
  const isAuthenticated = isDemoAuthenticated === 'true' && demoUser !== null && demoUser !== false;
  
  // DEBUG: Logs optimizados para NavigationLegacy
  useEffect(() => {
    logger.info('🔍 NavigationLegacy - Estado completo:', {
      isDemoAuthenticated,
      demoUser: !!demoUser,
      demoUserType: typeof demoUser,
      currentUserType,
      isAuthenticated
    });
  }, [isDemoAuthenticated, demoUser, currentUserType, isAuthenticated]);

  const baseNavItems = [
    { id: 'feed', icon: Home, label: 'Inicio', path: '/feed' },
    { id: 'discover', icon: Search, label: 'Descubrir', path: '/discover' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
    { id: 'matches', icon: Heart, label: 'Matches', path: '/matches' },
    { id: 'tokens', icon: Coins, label: 'Tokens', path: '/tokens' },
  ];

  // Navegación completamente estática - sin efectos de scroll

  // SIEMPRE mostrar navegación para usuarios demo - FIX CRÍTICO
  if (!isAuthenticated) {
    logger.info('⚠️ NavigationLegacy - No autenticado pero mostrando navegación demo');
    // NO return null - mostrar navegación siempre para demo
  }
  
  logger.info('✅ NavigationLegacy - Mostrando navegación completa');
  
  // Configuración específica para parejas
  const getSettingsPath = () => {
    return currentUserType === 'couple' ? '/edit-profile-couple' : '/edit-profile-single';
  };

  // Agregar solicitudes si la función está habilitada
  const navItems = features.requests 
    ? [
        ...baseNavItems.slice(0, 3), // feed, discover, chat
        { id: 'requests', icon: UserPlus, label: 'Solicitudes', path: '/requests' },
        ...baseNavItems.slice(3), // matches, tokens
        { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
        { id: 'settings', icon: Settings, label: 'Configuración', path: getSettingsPath() },
      ]
    : [
        ...baseNavItems,
        { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
        { id: 'settings', icon: Settings, label: 'Configuración', path: getSettingsPath() },
      ];

  // Agregar botón de logout si está autenticado
  if (isAuthenticated) {
    navItems.push({ id: 'logout', icon: LogOut, label: 'Salir', path: '/logout' });
  }

  const handleNavigation = (path: string) => {
    // Manejar logout especial - usar hooks para limpiar estado
    if (path === '/logout') {
          // Usar hooks para limpiar estado de forma segura
      localStorage.removeItem('demo_authenticated');
      localStorage.removeItem('demo_authenticated');
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_user');
      localStorage.removeItem('userType');
      sessionStorage.clear();
      navigate('/auth', { replace: true });
      return;
    }

    // Usar valores de hooks en lugar de localStorage directo
    const userType = currentUserType;
    const isDemoAuth = isDemoAuthenticated;
    
    logger.info('🔍 Navigation Debug:', { demoUser, userType, isDemoAuth, path });
    
    // Detectar tipo de usuario y redirigir al perfil correcto
    if (path === '/profile') {
      if (userType === 'couple') {
        navigate('/profile-couple');
      } else {
        navigate('/profile-single');
      }
      return;
    }
    
    // SIEMPRE permitir navegación para usuarios demo - FIX CRÍTICO
    const isAuthenticatedForNav = isDemoAuth === 'true' && demoUser;
    
    if (!isAuthenticatedForNav) {
      logger.info('⚠️ Usuario no autenticado pero permitiendo navegación demo');
      // NO redirigir a /auth - permitir navegación demo
    }
    
    // Rutas que requieren verificación adicional para parejas
    const coupleRoutes = ['/feed', '/discover', '/chat', '/matches', '/tokens'];
    
    if (coupleRoutes.includes(path) && userType === 'couple') {
      logger.info('✅ Navegación de pareja autorizada', { path });
    }
    
    // Navegar a la ruta solicitada
    navigate(path);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      currentUserType === 'couple' 
        ? "bg-gradient-to-r from-pink-900/95 via-rose-900/95 to-purple-900/95 backdrop-blur-xl border-t border-rose-300/40 shadow-2xl"
        : "bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-red-900/95 backdrop-blur-xl border-t border-pink-300/40 shadow-2xl",
      "px-3 sm:px-6 py-3 safe-area-pb",
      "translate-y-0 opacity-100",
      className
    )}>
      <div className="flex items-center justify-between w-full max-w-full mx-auto px-1 overflow-x-auto scrollbar-hide safe-area-inset">
        <div className="flex items-center justify-around w-full min-w-fit gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl",
                  "min-w-[50px] sm:min-w-[60px] w-[50px] sm:w-[60px] min-h-[50px] sm:min-h-[60px] group flex-shrink-0",
                  "transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95",
                  "relative overflow-hidden backdrop-blur-sm",
                  isActive 
                    ? currentUserType === 'couple'
                      ? "bg-gradient-to-r from-rose-300/20 to-pink-300/10 text-white shadow-xl border border-rose-300/30"
                      : "bg-gradient-to-r from-white/20 to-white/10 text-white shadow-xl border border-white/30"
                    : "text-white/85 hover:text-white hover:bg-white/10 hover:backdrop-blur-md"
                )}
              >
              {/* Animated background for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-xl animate-pulse" />
              )}
              
              <Icon 
                className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-1.5 transition-all duration-300 relative z-10",
                  isActive ? "scale-105 drop-shadow-lg text-white" : "group-hover:scale-105 group-hover:drop-shadow-md text-white/85"
                )} 
              />
              <span className={cn(
                "text-xs sm:text-sm font-medium transition-all duration-300 truncate max-w-[50px] sm:max-w-none relative z-10",
                isActive ? "text-white font-semibold" : "text-white/85 group-hover:text-white"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
        </div>
        
        {/* Theme Toggle - positioned in top right */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />
    </nav>
  );
};

export default Navigation;
