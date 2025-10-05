import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Users, 
  Camera, 
  Heart, 
  ChevronDown, 
  Coins, 
  Info,
  MessageCircle,
  Calendar,
  Building,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';


interface HeaderNavProps {
  className?: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user: _user } = useAuth();
  const userIsAuthenticated = isAuthenticated();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
      setOpenDropdown(openDropdown === item.id ? null : item.id);
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
    <header className={`bg-gradient-to-r from-purple-600/90 via-indigo-600/90 to-pink-600/90 backdrop-blur-sm border-b border-purple-400/40 shadow-xl shadow-purple-500/30 sticky top-0 z-50 transition-all duration-300 ${className}`}>
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

          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              const showItem = !item.requiresAuth || userIsAuthenticated;

              if (!showItem) return null;

              if (item.hasDropdown) {
                return (
                  <DropdownMenu key={item.id} open={openDropdown === item.id} onOpenChange={(open) => setOpenDropdown(open ? item.id : null)}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                          isActive ? 'bg-white/20' : ''
                        }`}
                      >
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                        <span className="ml-1 sm:ml-2 hidden sm:inline">{item.label}</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 backdrop-blur-sm border-white/20">
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
                  className={`text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                    isActive ? 'bg-white/20' : ''
                  }`}
                >
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                  <span className="ml-1 sm:ml-2 hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation - Floating Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenDropdown(openDropdown === 'mobile' ? null : 'mobile')}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 px-3 py-2"
            >
              <div className="flex flex-col space-y-1">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {openDropdown === 'mobile' && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  const showItem = !item.requiresAuth || userIsAuthenticated;

                  if (!showItem) return null;

                  if (item.hasDropdown) {
                    return (
                      <div key={item.id} className="col-span-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenDropdown(openDropdown === item.id ? 'mobile' : item.id)}
                          className={`w-full text-white hover:bg-white/10 transition-all duration-300 justify-start px-3 py-2 ${
                            isActive ? 'bg-white/20' : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${item.color} mr-2`} />
                          {item.label}
                          <ChevronDown className="h-3 w-3 ml-auto" />
                        </Button>
                        {openDropdown === item.id && (
                          <div className="ml-4 mt-2 space-y-1">
                            {getDropdownContent(item.id).map((dropdownItem, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  dropdownItem.action();
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-white/80 hover:bg-white/10 justify-start px-3 py-1 text-sm"
                              >
                                {dropdownItem.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleNavigation(item);
                        setOpenDropdown(null);
                      }}
                      className={`text-white hover:bg-white/10 transition-all duration-300 justify-start px-3 py-2 ${
                        isActive ? 'bg-white/20' : ''
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${item.color} mr-2`} />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {userIsAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="text-white hover:bg-white/10"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:block ml-1">Perfil</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/premium')}
                  className="border-pink-400/50 text-pink-300 hover:bg-pink-400/10 bg-pink-500/20"
                >
                  <span className="text-xs font-semibold">Premium</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="border-white/30 text-white hover:bg-white/10 bg-white/5"
                >
                  <span className="text-xs font-medium">Iniciar Sesión</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/premium')}
                  className="border-pink-400/50 text-pink-300 hover:bg-pink-400/10 bg-pink-500/20"
                >
                  <span className="text-xs font-semibold">Premium</span>
                </Button>
              </div>
            )}
          </div>
      </div>
    </header>
  );
};

export default HeaderNav;
