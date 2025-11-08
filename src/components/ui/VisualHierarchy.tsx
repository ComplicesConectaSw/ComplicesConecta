import React from 'react';
import { cn } from '@/shared/lib/cn';

interface VisualHierarchyProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'display';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

const levelClasses = {
  1: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  2: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  3: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  4: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  5: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  6: 'text-base sm:text-lg md:text-xl lg:text-2xl',
};

const variantClasses = {
  heading: 'font-heading font-bold leading-tight tracking-tight',
  subheading: 'font-heading font-semibold leading-snug tracking-tight',
  body: 'font-sans font-normal leading-relaxed',
  caption: 'font-sans font-medium leading-normal text-sm',
  display: 'font-display font-bold leading-none tracking-tighter',
};

const colorClasses = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  muted: 'text-muted-foreground/80',
  accent: 'text-primary',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

export const VisualHierarchy: React.FC<VisualHierarchyProps> = ({
  children,
  level = 1,
  className,
  variant = 'heading',
  color = 'primary',
  weight,
}) => {
  const Tag = `h${level}` as React.ElementType;
  
  const classes = cn(
    levelClasses[level],
    variantClasses[variant],
    colorClasses[color],
    weight && weightClasses[weight],
    className
  );

  return (
    <Tag className={classes}>
      {children}
    </Tag>
  );
};

interface SpacingSystemProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const spacingClasses = {
  none: '',
  xs: 'p-1',
  sm: 'p-2 sm:p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-12',
  '2xl': 'p-12 sm:p-16',
};

const marginClasses = {
  none: '',
  xs: 'm-1',
  sm: 'm-2 sm:m-3',
  md: 'm-4 sm:m-6',
  lg: 'm-6 sm:m-8',
  xl: 'm-8 sm:m-12',
  '2xl': 'm-12 sm:m-16',
};

const gapClasses = {
  none: '',
  xs: 'gap-1',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-12',
  '2xl': 'gap-12 sm:gap-16',
};

export const SpacingSystem: React.FC<SpacingSystemProps> = ({
  children,
  className,
  padding = 'md',
  margin = 'none',
  gap = 'none',
}) => {
  return (
    <div
      className={cn(
        spacingClasses[padding],
        marginClasses[margin],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHierarchyProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  border?: 'none' | 'sm' | 'md' | 'lg';
}

const elevationClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const radiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

const borderClasses = {
  none: '',
  sm: 'border',
  md: 'border-2',
  lg: 'border-4',
};

export const CardHierarchy: React.FC<CardHierarchyProps> = ({
  children,
  className,
  elevation = 'md',
  radius = 'xl',
  border = 'sm',
}) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground',
        elevationClasses[elevation],
        radiusClasses[radius],
        borderClasses[border],
        'border-border',
        className
      )}
    >
      {children}
    </div>
  );
};



