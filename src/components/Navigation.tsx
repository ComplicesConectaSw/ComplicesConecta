import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, Heart, User, Settings, Crown, LogOut, Coins, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatures } from '@/hooks/useFeatures';
import NavigationEnhanced from '@/components/NavigationEnhanced';
import { logger } from '@/lib/logger';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { motion } from 'framer-motion';
import { usePersistedState } from '@/hooks/usePersistedState';

interface NavigationProps {
  className?: string;
}

// Usar NavigationLegacy temporalmente para el usuario especial
const Navigation = ({ className }: NavigationProps) => {
  // Migrar localStorage a hook tipado
  const [isSpecialUser] = usePersistedState('apoyo_authenticated', false);
  
  if (isSpecialUser) {
    return <NavigationLegacy className={className} />;
  }
  
  return (
    <NavigationEnhanced 
      className={className}
      showNotificationBadges={true}
      enableAnimations={true}
      notificationCounts={{}}
    />
  );
};

// Export del componente original para casos específicos
export const NavigationLegacy = ({ className }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { features } = useFeatures();
  
  // Navegación siempre visible - sin efectos de scroll
  const [isVisible] = useState(true);

  // localStorage migrado a hooks tipados - todos los hooks al inicio
  const [isDemoAuthenticated] = usePersistedState('demo_authenticated', false);
  const [isSpecialAuthenticated] = usePersistedState('apoyo_authenticated', false);
  const [demoUser] = usePersistedState('demo_user', null);
  const [specialUser] = usePersistedState('apoyo_user', null);
  const [currentUserType] = usePersistedState('userType', null);
  
  const isAuthenticated = isDemoAuthenticated || isSpecialAuthenticated;

  const baseNavItems = [
    { id: 'feed', icon: Home, label: 'Inicio', path: '/feed' },
    { id: 'discover', icon: Search, label: 'Descubrir', path: '/discover' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
    { id: 'matches', icon: Heart, label: 'Matches', path: '/matches' },
    { id: 'tokens', icon: Coins, label: 'Tokens', path: '/tokens' },
  ];

  // Navegación completamente estática - sin efectos de scroll

  // Solo mostrar navegación completa si está autenticado
  if (!isAuthenticated || (!demoUser && !specialUser)) {
    return null; // Ocultar navegación si no está logueado
  }
  
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
      localStorage.removeItem('apoyo_authenticated');
      localStorage.removeItem('demo_user');
      localStorage.removeItem('apoyo_user');
      localStorage.removeItem('userType');
      sessionStorage.clear();
      navigate('/auth', { replace: true });
      return;
    }

    // Usar valores de hooks en lugar de localStorage directo
    const userType = currentUserType;
    const isDemoAuth = isDemoAuthenticated;
    const isSpecialAuth = isSpecialAuthenticated;
    
    logger.info('🔍 Navigation Debug:', { demoUser, specialUser, userType, isDemoAuth, isSpecialAuth, path });
    
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
    const isAuthenticated = isDemoAuth || isSpecialAuth || demoUser || specialUser;
    
    if (!isAuthenticated) {
      logger.info('❌ Usuario no autenticado, redirigiendo a /auth');
      navigate('/auth');
      return;
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
      <div className="flex items-center justify-between w-full max-w-full mx-auto px-1 overflow-x-auto scrollbar-hide">
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
                  "transition-all duration-400 ease-out transform hover:scale-102",
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
                  "w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-1.5 transition-all duration-400 relative z-10",
                  isActive ? "scale-105 drop-shadow-lg text-white" : "group-hover:scale-105 group-hover:drop-shadow-md text-white/85"
                )} 
              />
              <span className={cn(
                "text-xs sm:text-sm font-medium transition-all duration-400 truncate max-w-[50px] sm:max-w-none relative z-10",
                isActive ? "text-white font-semibold" : "text-white/85 group-hover:text-white"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
        </div>
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />
    </nav>
  );
};

export default Navigation;
