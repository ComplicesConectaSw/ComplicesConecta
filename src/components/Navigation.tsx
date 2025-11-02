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
    return _currentUserType === 'couple' ? '/edit-profile-couple' : '/edit-profile-single';
  };

  // Navegación según imagen: Inicio, Descubrir, Chat, Solicitudes, Matches, Tokens, Perfil, Config
  const navItems = _features.requests 
    ? [
        { id: 'feed', icon: Home, label: 'Inicio', path: '/feed' },
        { id: 'discover', icon: Search, label: 'Descubrir', path: '/discover' },
        { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
        { id: 'requests', icon: UserPlus, label: 'Solicitudes', path: '/requests' },
        { id: 'matches', icon: Heart, label: 'Matches', path: '/matches' },
        { id: 'tokens', icon: Coins, label: 'Tokens', path: '/tokens' },
        { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
        { id: 'settings', icon: Settings, label: 'Config', path: getSettingsPath() },
      ]
    : [
        { id: 'feed', icon: Home, label: 'Inicio', path: '/feed' },
        { id: 'discover', icon: Search, label: 'Descubrir', path: '/discover' },
        { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
        { id: 'matches', icon: Heart, label: 'Matches', path: '/matches' },
        { id: 'tokens', icon: Coins, label: 'Tokens', path: '/tokens' },
        { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
        { id: 'settings', icon: Settings, label: 'Config', path: getSettingsPath() },
      ];

  // Agregar botón de logout si está autenticado
  if (isAuthenticated) {
    navItems.push({ id: 'logout', icon: LogOut, label: 'Salir', path: '/logout' });
  }

  const handleNavigation = (path: string) => {
    try {
      // Manejar logout especial - usar hooks para limpiar estado
      if (path === '/logout') {
        localStorage.removeItem('demo_authenticated');
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
      if (path === '/profile' || path === '/profile-single' || path === '/profile-couple') {
        if (userType === 'couple') {
          _navigate('/profile-couple', { replace: false });
        } else {
          _navigate('/profile-single', { replace: false });
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
      
      // Navegar a la ruta solicitada - asegurar que siempre navegue
      logger.info('🚀 Navegando a:', path);
      _navigate(path, { replace: false });
    } catch (error) {
      logger.error('❌ Error en handleNavigation:', { error: String(error), path });
      // Fallback: intentar navegar de todos modos
      try {
        _navigate(path, { replace: false });
      } catch (navError) {
        logger.error('❌ Error crítico navegando:', { error: String(navError), path });
      }
    }
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-blue-900/95 backdrop-blur-xl border-t border-purple-500/40 shadow-2xl",
      "px-2 sm:px-4 py-2 sm:py-3 safe-area-pb",
      "translate-y-0 opacity-100",
      className
    )}>
      <div className="flex items-center justify-between w-full max-w-full mx-auto overflow-x-auto scrollbar-hide safe-area-inset">
        <div className="flex items-center justify-around w-full min-w-fit gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Verificar ruta activa considerando múltiples rutas posibles
            const isActive = _location.pathname === item.path || 
                           (item.path === '/profile' && (_location.pathname === '/profile-single' || _location.pathname === '/profile-couple')) ||
                           (item.path === '/feed' && _location.pathname.startsWith('/feed')) ||
                           (item.path === '/chat' && _location.pathname.startsWith('/chat'));
            
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNavigation(item.path);
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl sm:rounded-2xl",
                  "min-w-[45px] sm:min-w-[55px] w-[45px] sm:w-[55px] min-h-[50px] sm:min-h-[60px] group flex-shrink-0",
                  "transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95",
                  "relative overflow-visible backdrop-blur-sm cursor-pointer",
                  isActive 
                    ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white shadow-lg border border-purple-400/50"
                    : "text-white/85 hover:text-white hover:bg-white/10 hover:backdrop-blur-md"
                )}
              >
              {/* Animated background for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl animate-pulse" />
              )}
              
              <Icon 
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 transition-all duration-300 relative z-10 flex-shrink-0",
                  isActive ? "scale-110 drop-shadow-lg text-white" : "group-hover:scale-110 group-hover:drop-shadow-md text-white/85"
                )} 
              />
              <span className={cn(
                "text-[9px] sm:text-[10px] font-medium transition-all duration-300 relative z-10 leading-tight text-center whitespace-nowrap",
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
