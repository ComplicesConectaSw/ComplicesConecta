import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'love' | 'premium' | 'glass';
  delay?: number;
  className?: string;
}

const cardVariants = {
  default: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -5, scale: 1.02 },
  },
  hover: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -8, scale: 1.05, rotateY: 5 },
  },
  love: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.08, rotateZ: 2 },
  },
  premium: {
    initial: { opacity: 0, y: 40, rotateX: -10 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    hover: { y: -10, scale: 1.05, rotateX: 5 },
  },
  glass: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.03, backdropBlur: '20px' },
  },
};

const variantClasses = {
  default: "bg-card-gradient shadow-card hover:shadow-hover",
  hover: "bg-card-gradient shadow-card hover:shadow-love",
  love: "bg-love-gradient shadow-love hover:shadow-glow",
  premium: "bg-premium-gradient shadow-premium hover:shadow-glow",
  glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-soft",
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  variant = 'default',
  delay = 0,
  className,
  ...props
}) => {
  const variantConfig = cardVariants[variant];
  const variantClass = variantClasses[variant];

  return (
    <motion.div
      variants={variantConfig}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer",
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};