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
  const _navigate = useNavigate();
  const _location = useLocation();
  const { features: _features } = useFeatures();
  
  // Navegación siempre visible - sin efectos de scroll
  const [_isVisible] = useState(true);

  // localStorage migrado a hooks tipados - todos los hooks al inicio
  const [_isDemoAuthenticated] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState('demo_user', null);
  const [_currentUserType] = usePersistedState('userType', null);
  
  const isAuthenticated = _isDemoAuthenticated === 'true' && demoUser !== null && demoUser !== false;
  
  // DEBUG: Logs optimizados para NavigationLegacy
  useEffect(() => {
    logger.info('🔍 NavigationLegacy - Estado completo:', {
      isDemoAuthenticated: _isDemoAuthenticated,
      demoUser: !!demoUser,
      demoUserType: typeof demoUser,
      currentUserType: _currentUserType,
      isAuthenticated
    });
  }, [_isDemoAuthenticated, demoUser, _currentUserType, isAuthenticated]);

  // SOLO mostrar navegación si hay sesión demo/producción iniciada
  if (!isAuthenticated) {
    logger.info('⚠️ NavigationLegacy - No autenticado, NO mostrar navegación inferior');
    return null; // NO mostrar navegación si no hay sesión
  }
  
  logger.info('✅ NavigationLegacy - Mostrando navegación completa para usuario autenticado');
  
  // Items de navegación según la imagen: Inicio, Descubrir, Chat, Solicitudes, Matches, Tokens, Perfil
  const navItems = [
    { id: 'inicio', icon: Home, label: 'Inicio', path: '/feed' },
    { id: 'discover', icon: Search, label: 'Descubrir', path: '/discover' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
    { id: 'requests', icon: UserPlus, label: 'Solicitudes', path: '/requests' },
    { id: 'matches', icon: Heart, label: 'Matches', path: '/matches' },
    { id: 'tokens', icon: Coins, label: 'Tokens', path: '/tokens' },
    { id: 'profile', icon: User, label: 'Perfil', path: '/profile' }
  ];

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
      _navigate('/auth', { replace: true });
      return;
    }

    // Usar valores de hooks en lugar de localStorage directo
    const userType = _currentUserType;
    const isDemoAuth = _isDemoAuthenticated;
    
    logger.info('🔍 Navigation Debug:', { demoUser, userType, isDemoAuth, path });
    
    // Detectar tipo de usuario y redirigir al perfil correcto
    if (path === '/profile') {
      const profilePath = _currentUserType === 'couple' ? '/profile-couple' : '/profile-single';
      logger.info('🔄 Redirigiendo al perfil según tipo de cuenta', { userType: _currentUserType, profilePath });
      _navigate(profilePath);
      return;
    }
    
    // Verificar autenticación antes de navegar
    const isAuthenticatedForNav = isDemoAuth === 'true' && demoUser;
    
    if (!isAuthenticatedForNav) {
      logger.warn('⚠️ Usuario no autenticado, redirigiendo a auth');
      _navigate('/auth', { replace: true });
      return;
    }
    
    // Navegar a la ruta solicitada
    logger.info('✅ Navegación autorizada', { path, userType: _currentUserType });
    _navigate(path);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-blue-900/95 backdrop-blur-xl border-t border-purple-500/40 shadow-2xl",
      "px-3 sm:px-6 py-3 safe-area-pb",
      "translate-y-0 opacity-100",
      className
    )}>
      <div className="flex items-center justify-between w-full max-w-full mx-auto px-1 overflow-x-auto scrollbar-hide safe-area-inset">
        <div className="flex items-center justify-around w-full min-w-fit gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = _location.pathname === item.path;
            
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
                    ? "bg-gradient-to-r from-purple-500/30 to-blue-500/20 text-white shadow-xl border border-purple-400/50"
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
                "text-[10px] sm:text-xs font-medium transition-all duration-300 relative z-10 leading-tight",
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
    </nav>
  );
};

export default Navigation;
