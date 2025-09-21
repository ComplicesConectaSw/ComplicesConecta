import React from 'react';
import { motion } from 'framer-motion';
import { Theme } from '@/hooks/useProfileTheme';
import { Palette, Sun, Moon, Sparkles, Zap, Heart } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: Theme;
  onThemeSelect: (theme: Theme) => void;
  className?: string;
}

const themeOptions = [
  {
    id: 'light' as Theme,
    name: 'Claro',
    icon: Sun,
    description: 'Tema luminoso y limpio',
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    textColor: 'text-gray-800'
  },
  {
    id: 'dark' as Theme,
    name: 'Oscuro',
    icon: Moon,
    description: 'Tema elegante y moderno',
    preview: 'bg-gradient-to-br from-gray-900 to-purple-900',
    textColor: 'text-white'
  },
  {
    id: 'elegant' as Theme,
    name: 'Elegante',
    icon: Sparkles,
    description: 'Sofisticado y refinado',
    preview: 'bg-gradient-to-br from-slate-800 to-rose-900',
    textColor: 'text-rose-100'
  },
  {
    id: 'modern' as Theme,
    name: 'Moderno',
    icon: Zap,
    description: 'Vibrante y dinámico',
    preview: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    textColor: 'text-white'
  },
  {
    id: 'vibrant' as Theme,
    name: 'Vibrante',
    icon: Heart,
    description: 'Colorido y energético',
    preview: 'bg-gradient-to-br from-pink-500 to-orange-500',
    textColor: 'text-white'
  }
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Elige tu tema</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themeOptions.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          
          return (
            <motion.button
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-purple-400 shadow-lg shadow-purple-400/25' 
                  : 'border-gray-600 hover:border-gray-500'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Preview Background */}
              <div className={`
                absolute inset-0 rounded-xl opacity-20 ${theme.preview}
              `} />
              
              {/* Content */}
              <div className="relative z-10 text-center space-y-2">
                <div className="flex justify-center">
                  <Icon className={`w-8 h-8 ${theme.textColor}`} />
                </div>
                
                <h4 className="font-semibold text-white">{theme.name}</h4>
                <p className="text-sm text-gray-300">{theme.description}</p>
                
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-gray-400 mt-4">
        Puedes cambiar tu tema en cualquier momento desde tu perfil
      </div>
    </div>
  );
};
