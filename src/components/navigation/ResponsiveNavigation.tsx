import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Heart, 
  MessageCircle, 
  User, 
  Menu, 
  X, 
  Bell,
  Settings,
  LogOut,
  Crown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuth } from '@/features/auth/useAuth';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  premium?: boolean;
}

interface ResponsiveNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  currentPath,
  onNavigate,
  className
}) => {
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: <Home className="h-5 w-5" />,
      href: '/'
    },
    {
      id: 'discover',
      label: 'Descubrir',
      icon: <Search className="h-5 w-5" />,
      href: '/discover'
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: <Heart className="h-5 w-5" />,
      href: '/matches',
      badge: 3
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="h-5 w-5" />,
      href: '/chat',
      badge: 5
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: <User className="h-5 w-5" />,
      href: '/profile'
    }
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  const NavigationButton: React.FC<{ item: NavigationItem; isMobile?: boolean }> = ({ 
    item, 
    isMobile = false 
  }) => {
    const isActive = currentPath === item.href;
    
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <UnifiedButton
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "relative transition-all duration-200",
            isMobile ? "w-full justify-start gap-3 p-4" : "p-3",
            isActive && "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg",
            !isActive && "hover:bg-pink-50 hover:text-pink-600"
          )}
          onClick={() => {
            onNavigate(item.href);
            if (isMobile) setIsMobileMenuOpen(false);
          }}
        >
          <div className="relative">
            {item.icon}
            {item.badge && item.badge > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
          </div>
          {isMobile && (
            <span className="font-medium">{item.label}</span>
          )}
          {item.premium && (
            <Crown className="h-3 w-3 text-yellow-500 ml-1" />
          )}
        </UnifiedButton>
      </motion.div>
    );
  };

  // Mobile Navigation
  if (isMobile) {
    return (
      <>
        {/* Top Bar */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-40",
            "bg-white/90 backdrop-blur-sm border-b border-gray-200",
            "px-4 py-3 flex items-center justify-between",
            className
          )}
        >
          <UnifiedButton
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2"
          >
            <Menu className="h-6 w-6" />
          </UnifiedButton>

          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-500" />
            <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent stable-element">
              ComplicesConecta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UnifiedButton variant="ghost" size="sm" className="p-2">
              <Bell className="h-5 w-5" />
            </UnifiedButton>
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || profile?.first_name} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">
                {profile?.display_name || profile?.first_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </motion.div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-2 py-2"
        >
          <div className="flex items-center justify-around">
            {navigationItems.map((item) => (
              <NavigationButton key={item.id} item={item} />
            ))}
          </div>
        </motion.div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed inset-0 z-50 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              <motion.div
                variants={sidebarVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white shadow-xl"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || profile?.first_name} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                          {profile?.display_name || profile?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {profile?.display_name || profile?.first_name || 'Usuario'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user?.email || 'usuario@ejemplo.com'}
                        </p>
                      </div>
                    </div>
                    
                    <UnifiedButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2"
                    >
                      <X className="h-5 w-5" />
                    </UnifiedButton>
                  </div>

                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <NavigationButton key={item.id} item={item} isMobile />
                    ))}
                    
                    <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                      <UnifiedButton
                        variant="ghost"
                        className="w-full justify-start gap-3 p-4"
                      >
                        <Settings className="h-5 w-5" />
                        Configuración
                      </UnifiedButton>
                      
                      <UnifiedButton
                        variant="ghost"
                        className="w-full justify-start gap-3 p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                      </UnifiedButton>
                    </div>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Navigation
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40",
        "w-20 hover:w-64 transition-all duration-300",
        "bg-white/90 backdrop-blur-sm border-r border-gray-200",
        "group overflow-hidden",
        className
      )}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 min-h-[48px]">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h2 className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent stable-element">
              ComplicesConecta
            </h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UnifiedButton
                  variant={currentPath === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 p-3 transition-all duration-200",
                    currentPath === item.href && "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg",
                    currentPath !== item.href && "hover:bg-pink-50 hover:text-pink-600"
                  )}
                  onClick={() => onNavigate(item.href)}
                >
                  <div className="relative flex-shrink-0">
                    {item.icon}
                    {item.badge && item.badge > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium">
                    {item.label}
                  </span>
                  {item.premium && (
                    <Crown className="h-3 w-3 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </UnifiedButton>
              </motion.div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || profile?.first_name} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                {profile?.display_name || profile?.first_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.display_name || profile?.first_name}</p>
              <p className="text-sm text-gray-500 truncate">
                {profile?.display_name || profile?.first_name || 'Usuario'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.email || 'usuario@ejemplo.com'}
              </p>
            </div>
          </div>
          
          <UnifiedButton
            variant="ghost"
            className="w-full justify-start gap-3 p-3 hover:bg-gray-50"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Configuración
            </span>
          </UnifiedButton>
        </div>
      </div>
    </motion.div>
  );
};
