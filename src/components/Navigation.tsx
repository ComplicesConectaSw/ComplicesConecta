import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, Heart, User, Settings, UserPlus, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatures } from '@/hooks/useFeatures';

interface NavigationProps {
  className?: string;
}

const Navigation = ({ className }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { features } = useFeatures();

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

  // Solo mostrar navegación completa si está autenticado
  if (!isAuthenticated || !demoUser) {
    return null; // Ocultar navegación si no está logueado
  }

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

  const handleNavigation = (path: string) => {
    // Verificar sesión antes de navegar
    const demoUser = localStorage.getItem('demo_user');
    const userType = localStorage.getItem('userType');
    
    if (!demoUser && path !== '/auth') {
      navigate('/auth');
      return;
    }
    
    // Detectar tipo de usuario y redirigir al perfil correcto
    if (path === '/profile') {
      if (userType === 'couple') {
        navigate('/profile-couple');
      } else {
        navigate('/profile-single');
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50",
      "px-2 sm:px-4 py-2 safe-area-pb",
      className
    )}>
      <div className="flex items-center justify-around max-w-md mx-auto overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl transition-all duration-200",
                "min-w-[50px] sm:min-w-[60px] min-h-[50px] sm:min-h-[60px] group flex-shrink-0",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon 
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 transition-all duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )} 
              />
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-all duration-200 truncate max-w-[50px] sm:max-w-none",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
