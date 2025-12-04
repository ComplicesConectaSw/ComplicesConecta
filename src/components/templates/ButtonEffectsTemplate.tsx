import React from 'react';
import { motion } from 'framer-motion';
import { useProfileTheme } from '@/features/profile/useProfileTheme';
import { Gender, ProfileType, Theme } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/shared/lib/cn';

interface ButtonEffectsTemplateProps {
  theme?: Theme;
  profileType?: ProfileType;
  gender?: Gender;
  className?: string;
}

export const ButtonEffectsTemplate: React.FC<ButtonEffectsTemplateProps> = ({
  theme = 'modern',
  profileType = 'single',
  gender = 'male',
  className
}) => {
  const themeConfig = useProfileTheme(profileType, [gender as any], theme);

  const buttonVariants = [
    {
      name: 'Swipe Effect',
      className: 'btn-swipe relative overflow-hidden group',
      hoverEffect: 'before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] before:transition-transform before:duration-300 group-hover:before:translate-x-0'
    },
    {
      name: 'Diagonal Swipe',
      className: 'btn-diagonal-swipe relative overflow-hidden group',
      hoverEffect: 'before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] before:skew-x-12 before:transition-transform before:duration-300 group-hover:before:translate-x-0'
    },
    {
      name: 'Scale & Glow',
      className: 'btn-scale-glow transition-all duration-300',
      hoverEffect: 'hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25'
    },
    {
      name: 'Bounce',
      className: 'btn-bounce transition-transform duration-200',
      hoverEffect: 'hover:scale-110 active:scale-95'
    },
    {
      name: 'Slide Up',
      className: 'btn-slide-up relative overflow-hidden group',
      hoverEffect: 'before:absolute before:bottom-0 before:left-0 before:w-full before:h-0 before:bg-white/20 before:transition-all before:duration-300 group-hover:before:h-full'
    },
    {
      name: 'Ripple',
      className: 'btn-ripple relative overflow-hidden group',
      hoverEffect: 'after:absolute after:top-1/2 after:left-1/2 after:w-0 after:h-0 after:bg-white/30 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full group-hover:after:h-full after:-translate-x-1/2 after:-translate-y-1/2'
    }
  ];

  return (
    <div className={cn("p-8 rounded-lg", themeConfig.backgroundClass, className)}>
      <div className="text-center mb-8">
        <h2 className={cn("text-2xl font-bold mb-2", themeConfig.textClass)}>
          Efectos de Botones Modernos
        </h2>
        <p className={cn("text-sm", themeConfig.accentClass)}>
          Hover sobre los botones para ver los efectos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {buttonVariants.map((variant, index) => (
          <motion.div
            key={variant.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <Button
              className={cn(
                'w-full min-h-[48px] relative z-10',
                variant.className,
                variant.hoverEffect,
                themeConfig.backgroundClass,
                themeConfig.textClass,
                'border border-white/20'
              )}
            >
              <span className="relative z-10">{variant.name}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Advanced Effects Section */}
      <div className="mt-12">
        <h3 className={cn("text-xl font-semibold mb-6 text-center", themeConfig.textClass)}>
          Efectos Avanzados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gradient Shift Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Button
              className={cn(
                'w-full h-16 text-lg font-semibold relative overflow-hidden group',
                'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
                'hover:from-red-500 hover:via-pink-500 hover:to-purple-500',
                'transition-all duration-500 ease-in-out',
                'shadow-lg hover:shadow-xl hover:shadow-purple-500/25'
              )}
            >
              <span className="relative z-10 text-white">Gradient Shift</span>
            </Button>
          </motion.div>

          {/* 3D Transform Button */}
          <motion.div
            whileHover={{ rotateX: 5, rotateY: 5 }}
            style={{ perspective: 1000 }}
            className="relative"
          >
            <Button
              className={cn(
                'w-full h-16 text-lg font-semibold',
                'bg-gradient-to-br from-blue-600 to-purple-600',
                'hover:from-purple-600 hover:to-blue-600',
                'transition-all duration-300',
                'shadow-lg hover:shadow-2xl',
                'transform-gpu hover:translate-y-[-2px]'
              )}
            >
              <span className="text-white">3D Transform</span>
            </Button>
          </motion.div>

          {/* Neon Glow Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Button
              className={cn(
                'w-full h-16 text-lg font-semibold',
                'bg-black border-2 border-cyan-400',
                'text-cyan-400 hover:text-white',
                'transition-all duration-300',
                'hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-400/50',
                'hover:animate-pulse'
              )}
            >
              Neon Glow
            </Button>
          </motion.div>

          {/* Morphing Button */}
          <motion.div
            whileHover={{ borderRadius: '50px' }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Button
              className={cn(
                'w-full h-16 text-lg font-semibold',
                'bg-gradient-to-r from-green-400 to-blue-500',
                'hover:from-blue-500 hover:to-green-400',
                'transition-all duration-300',
                'shadow-lg hover:shadow-xl'
              )}
            >
              <span className="text-white">Morphing Shape</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="mt-12 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className={cn("text-lg font-semibold mb-4", themeConfig.textClass)}>
          Demo Interactivo
        </h3>
        <p className={cn("text-sm mb-4", themeConfig.accentClass)}>
          Estos efectos están integrados con el sistema de temas v2.8.3 y se adaptan automáticamente.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <Button className="btn-animated hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            Tema Aplicado
          </Button>
          <Button variant="outline" className="btn-animated hover:scale-105 border-white/20 text-white hover:bg-white/10">
            Outline Style
          </Button>
          <Button variant="ghost" className={cn("btn-animated hover:scale-105", themeConfig.textClass, "hover:bg-white/10")}>
            Ghost Style
          </Button>
        </div>
      </div>
    </div>
  );
};

// CSS personalizado para efectos avanzados (se puede agregar a index.css)
export const buttonEffectsCSS = `
/* Swipe Effect */
.btn-swipe::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.btn-swipe:hover::before {
  transform: translateX(100%);
}

/* Diagonal Swipe */
.btn-diagonal-swipe::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%) skewX(12deg);
  transition: transform 0.3s ease;
}

.btn-diagonal-swipe:hover::before {
  transform: translateX(100%) skewX(12deg);
}

/* Slide Up Effect */
.btn-slide-up::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: rgba(255,255,255,0.2);
  transition: height 0.3s ease;
  z-index: -1;
}

.btn-slide-up:hover::before {
  height: 100%;
}

/* Ripple Effect */
.btn-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.btn-ripple:hover::after {
  width: 300px;
  height: 300px;
}
`;

