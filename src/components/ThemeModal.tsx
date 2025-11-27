import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import { Theme } from '@/features/profile/useProfileTheme';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTheme: Theme;
  onThemeSelect: (theme: Theme) => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  selectedTheme,
  onThemeSelect,
  onConfirm,
  title = "Personaliza tu experiencia",
  subtitle = "Elige el tema que mejor refleje tu personalidad"
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl shadow-2xl border border-purple-500/20"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-900/95 to-purple-900/95 backdrop-blur-sm border-b border-purple-500/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Palette className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="text-gray-300">{subtitle}</p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <ThemeSelector
                selectedTheme={selectedTheme}
                onThemeChange={(theme) => {
                  if (theme) {
                    onThemeSelect(theme);
                  }
                }}
              />
            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-900/95 to-purple-900/95 backdrop-blur-sm border-t border-purple-500/20 p-6">
              <div className="flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                
                <motion.button
                  onClick={onConfirm}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirmar tema
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
