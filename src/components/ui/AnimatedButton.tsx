import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'love' | 'passion' | 'romance' | 'premium' | 'glow' | 'bounce';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
}

const buttonVariants = {
  love: {
    initial: { scale: 1 },
    hover: { scale: 1.05, rotateZ: 1 },
    tap: { scale: 0.95 },
  },
  passion: {
    initial: { scale: 1 },
    hover: { scale: 1.08, rotateY: 5 },
    tap: { scale: 0.9 },
  },
  romance: {
    initial: { scale: 1 },
    hover: { scale: 1.06, rotateX: 5 },
    tap: { scale: 0.95 },
  },
  premium: {
    initial: { scale: 1 },
    hover: { scale: 1.1, rotateZ: 2 },
    tap: { scale: 0.9 },
  },
  glow: {
    initial: { scale: 1, boxShadow: '0 0 20px rgba(0,0,0,0.1)' },
    hover: { scale: 1.05, boxShadow: '0 0 40px rgba(236,72,153,0.4)' },
    tap: { scale: 0.95 },
  },
  bounce: {
    initial: { y: 0 },
    hover: { y: -5 },
    tap: { y: 0 },
  },
};

const variantClasses = {
  love: "bg-love-gradient text-white font-bold shadow-love",
  passion: "bg-passion-gradient text-white font-bold shadow-passion",
  romance: "bg-romance-gradient text-white font-bold shadow-romance",
  premium: "bg-premium-gradient text-white font-bold shadow-premium",
  glow: "bg-primary text-primary-foreground shadow-glow",
  bounce: "bg-secondary text-secondary-foreground shadow-soft",
};

const sizeClasses = {
  sm: "h-9 px-4 py-2 text-sm",
  md: "h-11 px-6 py-2 text-sm",
  lg: "h-12 px-8 py-3 text-base",
  xl: "h-14 px-12 py-4 text-lg",
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'love',
  size = 'md',
  className,
  disabled = false,
  ...props
}) => {
  const variantConfig = buttonVariants[variant];
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  return (
    <motion.button
      variants={variantConfig}
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
      whileTap={disabled ? "initial" : "tap"}
      transition={{
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};