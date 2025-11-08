/**
 * Modal Unificado con Glass Effect y Animaciones
 * Componente reutilizable para todo el proyecto ComplicesConecta v2.8.2
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

export function UnifiedModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  className = ''
}: UnifiedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            className={`
              ${sizeClasses[size]} 
              bg-gradient-to-br from-purple-900/95 to-pink-900/95 
              backdrop-blur-md 
              border border-white/20 
              text-white 
              shadow-2xl
              rounded-xl
              ${className}
            `}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.2, 
                ease: "easeOut"
              }}
              className="relative"
            >
              {/* Header con título y botón cerrar */}
              {(title || showCloseButton) && (
                <DialogHeader className="relative">
                  {title && (
                    <DialogTitle className="text-white text-lg font-semibold pr-8">
                      {title}
                    </DialogTitle>
                  )}
                  
                  {showCloseButton && (
                    <motion.div
                      className="absolute top-0 right-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </DialogHeader>
              )}

              {/* Contenido del modal */}
              <div className="mt-4">
                {children}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default UnifiedModal;
