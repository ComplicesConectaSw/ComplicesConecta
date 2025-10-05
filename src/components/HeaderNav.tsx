import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Users, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Building, 
  HelpCircle, 
  Info,
  Crown,
  Camera,
  Coins,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


interface HeaderNavProps {
  className?: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user: _user } = useAuth();
  const userIsAuthenticated = isAuthenticated();
  const [_openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems = [
    {
      id: 'discover',
      label: 'Descubrir',
      icon: Search,
      path: '/discover',
      color: 'text-pink-400',
      requiresAuth: false
    },
    {
      id: 'profiles',
      label: 'Perfiles',
      icon: Users,
      path: '/profiles',
      color: 'text-purple-400',
      requiresAuth: false
    },
    {
      id: 'historias',
      label: 'Historias',
      icon: Camera,
      path: '/stories',
      color: 'text-indigo-400',
      requiresAuth: false,
      hasDropdown: true
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: Heart,
      path: '/matches',
      color: 'text-red-400',
      requiresAuth: false
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      path: '/chat',
      color: 'text-blue-400',
      requiresAuth: true
    },
    {
      id: 'events',
      label: 'Eventos',
      icon: Calendar,
      path: '/events',
      color: 'text-yellow-400',
      requiresAuth: false
    },
    {
      id: 'empresa',
      label: 'Empresa',
      icon: Building,
      path: '/about',
      color: 'text-green-400',
      requiresAuth: false
    },
    {
      id: 'soporte',
      label: 'Soporte',
      icon: HelpCircle,
      path: '/support',
      color: 'text-orange-400',
      requiresAuth: false
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: Coins,
      path: '/tokens',
      color: 'text-yellow-400',
      requiresAuth: false,
      hasDropdown: true
    },
    {
      id: 'legal',
      label: 'Legal',
      icon: FileText,
      path: '/legal',
      color: 'text-gray-400',
      requiresAuth: false,
      hasDropdown: true
    },
    {
      id: 'informacion',
      label: 'Información',
      icon: Info,
      path: '/faq',
      color: 'text-cyan-400',
      requiresAuth: false
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (item: typeof navItems[0]) => {
    if (item.hasDropdown) {
      setOpenDropdown(_openDropdown === item.id ? null : item.id);
      return;
    }
    if (item.requiresAuth && !userIsAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate(item.path);
  };

  const getDropdownContent = (itemId: string) => {
    switch (itemId) {
      case 'historias':
        return [
          { label: 'Qué son las Historias', action: () => navigate('/stories/info') },
          { label: 'Características', action: () => navigate('/stories/features') },
          { label: 'Potencial y Beneficios', action: () => navigate('/stories/benefits') },
          { label: 'Ver Historias', action: () => navigate('/stories') }
        ];
      case 'tokens':
        return [
          { label: 'Sistema CMPX/GTK', action: () => navigate('/tokens/info') },
          { label: 'Cómo Ganar Tokens', action: () => navigate('/tokens/earn') },
          { label: 'Privacidad Tokens', action: () => navigate('/tokens/privacy') },
          { label: 'Términos Tokens', action: () => navigate('/tokens/terms') }
        ];
      case 'legal':
        return [
          { label: 'Términos de Servicio', action: () => navigate('/terms') },
          { label: 'Política de Privacidad', action: () => navigate('/privacy') },
          { label: 'Directrices', action: () => navigate('/guidelines') },
          { label: 'Legal Completo', action: () => navigate('/legal') }
        ];
      default:
        return [];
    }
  };

  return (
    <div className={`bg-black/30 backdrop-blur-sm border-b border-white/10 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Heart className="h-6 w-6 text-pink-500" fill="currentColor" />
            <span className="text-white font-bold text-lg hidden sm:block">
              ComplicesConecta
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              const showItem = !item.requiresAuth || userIsAuthenticated;

              if (!showItem) return null;

              if (item.hasDropdown) {
                return (
                  <DropdownMenu key={item.id} open={_openDropdown === item.id} onOpenChange={(open) => setOpenDropdown(open ? item.id : null)}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`
                          relative flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-white/20 text-white shadow-lg' 
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.color}`} />
                        <span className="hidden md:block text-xs font-medium">
                          {item.label}
                        </span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                        
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 border-white/20 backdrop-blur-sm">
                      {getDropdownContent(item.id).map((dropdownItem, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={dropdownItem.action}
                          className="text-white hover:bg-white/10 cursor-pointer"
                        >
                          {dropdownItem.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item)}
                  className={`
                    relative flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-lg' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.color}`} />
                  <span className="hidden md:block text-xs font-medium">
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                  
                  {/* Auth required badge for non-authenticated users */}
                  {item.requiresAuth && !userIsAuthenticated && showItem && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      <Crown className="h-3 w-3" />
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {userIsAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-white hover:bg-white/10"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:block ml-1">Perfil</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <span className="text-xs">Iniciar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderNav;
