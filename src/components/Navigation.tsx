import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Heart, User, Settings, Coins, Search, UserPlus, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useFeatures } from '@/hooks/useFeatures';
import { cn } from '@/shared/lib/cn';
import { getNavbarStyles } from '@/features/profile/useProfileTheme';
import { useAuth } from '@/features/auth/useAuth';
import { usePersistedState } from '@/hooks/usePersistedState';

interface NavigationProps {
  className?: string;
}

const Navigation = ({ className }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { features } = useFeatures();
  const { isAuthenticated, signOut, getProfileType } = useAuth();

  // Determinar el estilo del navbar desde localStorage para mantener la personalización del tema.
  const [navbarStyle] = usePersistedState<'transparent' | 'solid'>('demo_navbar_style', 'solid');
  const navbarStyles = getNavbarStyles(navbarStyle || 'solid');
  
  const profileType = getProfileType();

  const getSettingsPath = () => {
    return profileType === 'couple' ? '/edit-profile-couple' : '/edit-profile-single';
  };

  const navItems = features.requests 
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

  if (isAuthenticated()) {
    navItems.push({ id: 'logout', icon: LogOut, label: 'Salir', path: '/logout' });
  }

  const handleNavigation = async (path: string) => {
    if (path === '/logout') {
      await signOut();
      navigate('/auth', { replace: true });
      return;
    }

    if (path === '/profile') {
      navigate(profileType === 'couple' ? '/profile-couple' : '/profile-single');
      return;
    }
    
    navigate(path);
  };

  // No renderizar la barra de navegación en la página de autenticación
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      navbarStyles.backgroundClass,
      navbarStyles.shadowClass,
      navbarStyles.borderClass ? `border-t ${navbarStyles.borderClass}` : "border-t border-purple-500/40",
      "backdrop-blur-xl",
      "px-2 sm:px-4 py-2 sm:py-3 safe-area-pb",
      "translate-y-0 opacity-100",
      className
    )}>
      <div className="flex items-center justify-between w-full max-w-full mx-auto overflow-x-auto scrollbar-hide safe-area-inset">
        <div className="flex items-center justify-around w-full min-w-fit gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/profile' && (location.pathname === '/profile-single' || location.pathname === '/profile-couple')) ||
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
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
        
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
    </nav>
  );
};

export default Navigation;
