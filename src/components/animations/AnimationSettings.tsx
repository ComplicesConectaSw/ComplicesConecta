import React from 'react';
import { motion } from 'framer-motion';
import { AnimationContext } from '@/components/animations/AnimationProvider';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { Settings, Zap, Eye, Sparkles, Palette } from 'lucide-react';

interface AnimationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnimationSettings: React.FC<AnimationSettingsProps> = ({ isOpen, onClose }) => {
  // CRÍTICO: Los hooks deben llamarse siempre, no condicionalmente
  // Usar useContext directamente y manejar el caso undefined después
  const context = React.useContext(AnimationContext);
  
  // Si no hay provider, mostrar mensaje o retornar null
  if (!context) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-white">
          <p>AnimationProvider no está disponible</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/20 rounded">Cerrar</button>
        </div>
      </div>
    );
  }
  
  const { config, updateConfig } = context;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={panelVariants}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <UnifiedCard className="p-6 bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Configuración de Animaciones</h2>
          </div>

          <div className="space-y-6">
            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Movimiento Reducido</p>
                  <p className="text-white/60 text-sm">Para accesibilidad</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateConfig({ reducedMotion: !config.reducedMotion })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.reducedMotion ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{ x: config.reducedMotion ? 24 : 0 }}
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>

            {/* Animation Speed */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <p className="text-white font-medium">Velocidad de Animación</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <UnifiedButton
                    key={speed}
                    variant={config.animationSpeed === speed ? 'love' : 'default'}
                    size="sm"
                    onClick={() => updateConfig({ animationSpeed: speed })}
                    className="capitalize"
                  >
                    {speed === 'slow' ? 'Lenta' : speed === 'normal' ? 'Normal' : 'Rápida'}
                  </UnifiedButton>
                ))}
              </div>
            </div>

            {/* Particles Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="text-white font-medium">Partículas Flotantes</p>
                  <p className="text-white/60 text-sm">Efectos de fondo</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateConfig({ enableParticles: !config.enableParticles })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.enableParticles ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{ x: config.enableParticles ? 24 : 0 }}
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>

            {/* Background Animations Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Fondo Animado</p>
                  <p className="text-white/60 text-sm">Gradientes dinámicos</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateConfig({ enableBackgroundAnimations: !config.enableBackgroundAnimations })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.enableBackgroundAnimations ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{ x: config.enableBackgroundAnimations ? 24 : 0 }}
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>

            {/* Animation Preview */}
            <div className="border-t border-white/20 pt-4">
              <p className="text-white font-medium mb-3">Vista Previa</p>
              <div className="flex justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: config.reducedMotion ? 0.01 : 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <UnifiedButton
              variant="default"
              onClick={onClose}
              className="flex-1"
            >
              Cerrar
            </UnifiedButton>
            <UnifiedButton
              variant="love"
              onClick={() => {
                updateConfig({
                  reducedMotion: false,
                  animationSpeed: 'normal',
                  enableParticles: true,
                  enableBackgroundAnimations: true
                });
              }}
              className="flex-1"
            >
              Restablecer
            </UnifiedButton>
          </div>
        </UnifiedCard>
      </motion.div>
    </motion.div>
  );
};

// Settings button component
export const AnimationSettingsButton: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </motion.button>
      
      <AnimationSettings isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
