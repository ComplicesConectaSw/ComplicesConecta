import { useState, useEffect } from 'react';
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
  
  // Mover hooks al inicio antes de cualquier return
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    const isDemo = localStorage.getItem('demo_authenticated') === 'true';
    
    console.log('🔍 Navigation Debug:', { demoUser, userType, isDemo, path });
    
    // Detectar tipo de usuario y redirigir al perfil correcto
    if (path === '/profile') {
      if (userType === 'couple') {
        navigate('/profile-couple');
      } else {
        navigate('/profile-single');
      }
      return;
    }
    
    // Para otras rutas, navegar directamente si está autenticado
    if (isDemo || demoUser) {
      navigate(path);
    } else {
      // Solo redirigir a auth si no está autenticado y no es una ruta pública
      navigate('/auth');
    }
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
      "bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-red-900/90 backdrop-blur-xl border-t border-pink-300/30 shadow-2xl",
      "px-2 sm:px-4 py-2 safe-area-pb",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
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
                "flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl",
                "min-w-[50px] sm:min-w-[60px] min-h-[50px] sm:min-h-[60px] group flex-shrink-0",
                "transition-all duration-300 ease-out transform hover:scale-105",
                "relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 text-white shadow-lg scale-110" 
                  : "text-white/80 hover:text-white hover:bg-pink-500/20"
              )}
            >
              {/* Animated background for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-xl animate-pulse" />
              )}
              
              <Icon 
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 transition-all duration-300 relative z-10",
                  isActive ? "scale-110 drop-shadow-lg" : "group-hover:scale-110 group-hover:drop-shadow-md"
                )} 
              />
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-all duration-300 truncate max-w-[50px] sm:max-w-none relative z-10",
                isActive ? "text-white font-semibold" : "text-white/80 group-hover:text-white"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />
    </nav>
  );
};

export default Navigation;
