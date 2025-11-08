import React from 'react';
import { Heart, DollarSign, HelpCircle, Settings, User } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

interface EnhancedNavigationProps {
  className?: string;
}

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({ className }) => {
  const navItems = [
    'Descubrir',
    'Perfiles', 
    'Matches',
    'Chat',
    'Eventos',
    'Stories',
    'Empresa',
    'Moderadores',
    'Soporte',
    'Información'
  ];

  return (
    <nav className={cn(
      "bg-gradient-to-r from-purple-900 to-purple-800 px-6 py-4",
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-pink-400" fill="currentColor" />
          <span className="text-white text-xl font-bold">ComplicesConecta</span>
        </div>

        {/* Navigation Items */}
        <div className="hidden lg:flex items-center space-x-6">
          {navItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="text-white hover:text-pink-300 transition-colors duration-200 text-sm font-medium"
            >
              {item}
              {item === 'Información' && (
                <span className="ml-1 text-xs">▼</span>
              )}
            </a>
          ))}
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Tokens Icon */}
          <div className="relative">
            <DollarSign className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full"></div>
          </div>

          {/* Help Icon */}
          <HelpCircle className="w-5 h-5 text-white hover:text-pink-300 transition-colors cursor-pointer" />

          {/* Settings Icon */}
          <Settings className="w-5 h-5 text-white hover:text-pink-300 transition-colors cursor-pointer" />

          {/* User Icon */}
          <User className="w-5 h-5 text-white hover:text-pink-300 transition-colors cursor-pointer" />

          {/* Start Button */}
          <Button 
            variant="love" 
            size="sm"
            className="ml-2"
          >
            Iniciar
          </Button>
        </div>
      </div>
    </nav>
  );
};


