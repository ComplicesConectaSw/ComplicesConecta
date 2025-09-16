/**
 * Contenedor Responsivo Unificado
 * Componente para asegurar responsividad total en móviles, tabletas y desktop
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  centerContent?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'px-2 py-2 sm:px-4 sm:py-3',
  md: 'px-4 py-4 sm:px-6 sm:py-6',
  lg: 'px-6 py-6 sm:px-8 sm:py-8',
  xl: 'px-8 py-8 sm:px-12 sm:py-12'
};

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'full',
  padding = 'md',
  animated = true,
  centerContent = true
}: ResponsiveContainerProps) {
  const containerClasses = cn(
    'w-full',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    centerContent && 'mx-auto',
    'safe-area-inset', // Para dispositivos con notch
    className
  );

  if (animated) {
    return (
      <motion.div
        className={containerClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

export default ResponsiveContainer;
