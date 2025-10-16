import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Star, Zap } from 'lucide-react';

interface FloatingElementProps {
  icon: 'heart' | 'sparkles' | 'star' | 'zap';
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  duration?: number;
  className?: string;
}

const iconComponents = {
  heart: Heart,
  sparkles: Sparkles,
  star: Star,
  zap: Zap,
};

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const floatingVariants = {
  float: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    scale: [1, 1.1, 1],
  },
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.8, 0.3],
  },
  rotate: {
    rotate: [0, 360],
  },
};

export const FloatingElement: React.FC<FloatingElementProps> = ({
  icon,
  position,
  size = 'md',
  delay = 0,
  duration = 4,
  className = '',
}) => {
  const IconComponent = iconComponents[icon];
  const sizeClass = sizeClasses[size];

  return (
    <motion.div
      className={`absolute ${sizeClass} text-white/20 ${className}`}
      style={position}
      variants={floatingVariants.float as any}
      initial="float"
      animate="float"
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <IconComponent className="w-full h-full" fill="currentColor" />
    </motion.div>
  );
};

interface FloatingElementsProps {
  className?: string;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Hearts */}
      <FloatingElement
        icon="heart"
        position={{ top: '20%', left: '10%' }}
        size="lg"
        delay={0}
        duration={6}
      />
      <FloatingElement
        icon="heart"
        position={{ top: '30%', right: '15%' }}
        size="md"
        delay={1}
        duration={5}
      />
      <FloatingElement
        icon="heart"
        position={{ bottom: '25%', left: '20%' }}
        size="sm"
        delay={2}
        duration={7}
      />

      {/* Sparkles */}
      <FloatingElement
        icon="sparkles"
        position={{ top: '40%', right: '20%' }}
        size="sm"
        delay={0.5}
        duration={4}
      />
      <FloatingElement
        icon="sparkles"
        position={{ bottom: '40%', left: '15%' }}
        size="md"
        delay={1.5}
        duration={5}
      />

      {/* Stars */}
      <FloatingElement
        icon="star"
        position={{ top: '60%', left: '5%' }}
        size="sm"
        delay={3}
        duration={6}
      />
      <FloatingElement
        icon="star"
        position={{ top: '70%', right: '10%' }}
        size="md"
        delay={2.5}
        duration={5}
      />

      {/* Zap */}
      <FloatingElement
        icon="zap"
        position={{ top: '50%', left: '50%' }}
        size="sm"
        delay={4}
        duration={4}
      />
    </div>
  );
};


