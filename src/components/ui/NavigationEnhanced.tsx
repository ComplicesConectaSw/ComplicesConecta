import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  MessageCircle, 
  Heart, 
  Settings, 
  User,
  Menu,
  X,
  Bell,
  Search,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface NavigationEnhancedProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDemoMode?: boolean;
  className?: string;
}

export const NavigationEnhanced: React.FC<NavigationEnhancedProps> = ({
  currentPath,
  onNavigate,
  isDemoMode = false,
  className = ''
}) => {
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [_notifications, _setNotifications] = useState(3);

  const navigationItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Inicio',
      ariaLabel: 'Ir a página de inicio',
      badge: null
    },
    {
      path: '/profiles',
      icon: Users,
      label: 'Perfiles',
      ariaLabel: 'Ver perfiles de usuarios',
      badge: null
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Chat',
      ariaLabel: 'Abrir mensajes de chat',
      badge: _notifications > 99 ? '99+' : _notifications
    },
    {
      path: '/matches',
      icon: Heart,
      label: 'Matches',
      ariaLabel: 'Ver conexiones y matches',
      badge: null
    },
    {
      path: '/profile',
      icon: User,
      label: 'Mi Perfil',
      ariaLabel: 'Editar mi perfil',
      badge: null
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Configuración',
      ariaLabel: 'Abrir configuración',
      badge: null
    }
  ];

  const isActive = (path: string) => currentPath === path;

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('.mobile-nav-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className={`hidden md:flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40 ${className}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Logo y marca */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                ComplicesConecta
              </span>
              {isDemoMode && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  aria-label="Modo demostración activo"
                >
                  DEMO
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Navegación central */}
        <div className="flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.path}
                variant={active ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className={`
                  relative px-4 py-2 rounded-lg transition-all duration-200 btn-animated
                  ${active 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
                aria-label={item.ariaLabel}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge 
                    className="ml-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center"
                    aria-label={`${item.badge} notificaciones`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            aria-label="Buscar usuarios"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-gray-600 dark:text-gray-300"
            aria-label={`Notificaciones${_notifications > 0 ? ` (${_notifications} nuevas)` : ''}`}
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {_notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0">
                {_notifications > 99 ? '99+' : _notifications}
              </Badge>
            )}
          </Button>

          <div className="flex items-center space-x-2 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {profile?.display_name || profile?.first_name || user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.role === 'admin' ? 'Administrador' : 'Miembro'}
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden mobile-nav-container">
        {/* Header móvil */}
        <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  ComplicesConecta
                </span>
                {isDemoMode && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  >
                    DEMO
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 dark:text-gray-300"
                aria-label={`Notificaciones${_notifications > 0 ? ` (${_notifications} nuevas)` : ''}`}
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {_notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-[16px] flex items-center justify-center p-0">
                    {_notifications > 99 ? '99+' : _notifications}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300"
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Menú móvil desplegable */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <nav 
                className="px-4 py-2 space-y-1"
                role="navigation"
                aria-label="Menú de navegación móvil"
              >
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full justify-start px-4 py-3 rounded-lg transition-all duration-200
                        ${active 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                      aria-label={item.ariaLabel}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </nav>

              {/* Información del usuario en móvil */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.display_name || profile?.first_name || user?.email || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {profile?.role === 'admin' ? 'Administrador' : 'Miembro'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navegación inferior fija en móvil */}
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-40"
          role="navigation"
          aria-label="Navegación inferior"
        >
          <div className="flex items-center justify-around">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    relative flex flex-col items-center justify-center p-2 min-w-[60px] min-h-[60px] rounded-lg transition-all duration-200
                    ${active 
                      ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  aria-label={item.ariaLabel}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Espaciador para navegación fija */}
        <div className="h-20" aria-hidden="true"></div>
      </div>
    </>
  );
};

export default NavigationEnhanced;
