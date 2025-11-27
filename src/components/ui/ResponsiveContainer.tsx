import React from 'react';
import { cn } from '@/shared/lib/cn';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'wide' | 'narrow' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variantClasses = {
  default: 'max-w-7xl mx-auto',
  wide: 'max-w-8xl mx-auto',
  narrow: 'max-w-4xl mx-auto',
  full: 'w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-4 sm:px-6 lg:px-8',
  md: 'px-6 sm:px-8 lg:px-12',
  lg: 'px-8 sm:px-12 lg:px-16',
  xl: 'px-12 sm:px-16 lg:px-24',
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
}) => {
  return (
    <div
      className={cn(
        'w-full',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-12',
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
}) => {
  const gridCols = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'grid',
        gridCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { default: 'base', sm: 'lg', md: 'xl' },
  weight = 'normal',
  align = 'left',
}) => {
  const textSizes = [
    size.default && `text-${size.default}`,
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`,
    size.xl && `xl:text-${size.xl}`,
  ].filter(Boolean).join(' ');

  const textWeight = `font-${weight}`;
  const textAlign = `text-${align}`;

  return (
    <div
      className={cn(
        textSizes,
        textWeight,
        textAlign,
        className
      )}
    >
      {children}
    </div>
  );
};