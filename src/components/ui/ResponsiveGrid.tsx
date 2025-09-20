/**
 * Componente de Grid Responsivo
 * Asegura layouts perfectos en móviles, tabletas y desktop
 */

// @ts-nocheck - Temporary suppression for framer-motion type issues
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  animated = true
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridClasses = cn(
    'grid w-full',
    // Mobile columns
    cols.mobile === 1 && 'grid-cols-1',
    cols.mobile === 2 && 'grid-cols-2',
    cols.mobile === 3 && 'grid-cols-3',
    // Tablet columns
    cols.tablet === 1 && 'sm:grid-cols-1',
    cols.tablet === 2 && 'sm:grid-cols-2',
    cols.tablet === 3 && 'sm:grid-cols-3',
    cols.tablet === 4 && 'sm:grid-cols-4',
    // Desktop columns
    cols.desktop === 1 && 'lg:grid-cols-1',
    cols.desktop === 2 && 'lg:grid-cols-2',
    cols.desktop === 3 && 'lg:grid-cols-3',
    cols.desktop === 4 && 'lg:grid-cols-4',
    cols.desktop === 5 && 'lg:grid-cols-5',
    cols.desktop === 6 && 'lg:grid-cols-6',
    gapClasses[gap],
    className
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  if (animated) {
    return (
      <motion.div
        className={gridClasses}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="w-full"
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

export default ResponsiveGrid;
