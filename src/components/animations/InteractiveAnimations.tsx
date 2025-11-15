import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

// Magnetic button effect
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = "", 
  onClick 
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    x.set(deltaX * 0.3);
    y.set(deltaY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

// Parallax scroll effect
interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({ 
  children, 
  offset = 50, 
  className = "" 
}) => {
  const [elementTop, _setElementTop] = useState(0);
  const [clientHeight, _setClientHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const initial = elementTop - clientHeight;
  const final = elementTop + offset;
  
  const yRange = useTransform(
    useMotionValue(0),
    [initial, final],
    [offset, -offset]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y: yRange }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Ripple effect component
interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({ 
  children, 
  className = "", 
  onClick 
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
              width: 50,
              height: 50,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Morphing shape component
export const MorphingShape: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <motion.div
      className={`rounded-full bg-gradient-to-r from-primary to-accent ${className}`}
      animate={{
        borderRadius: ["50%", "25%", "50%", "25%", "50%"],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Floating elements
interface FloatingElementProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children, 
  intensity = 1, 
  className = "" 
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-10 * intensity, 10 * intensity, -10 * intensity],
        x: [-5 * intensity, 5 * intensity, -5 * intensity],
        rotate: [-2 * intensity, 2 * intensity, -2 * intensity],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Glitch effect
interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "" }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  };

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={triggerGlitch}
      animate={isGlitching ? {
        x: [0, -2, 2, -2, 2, 0],
        textShadow: [
          "0 0 0 transparent",
          "2px 0 0 #ff0000, -2px 0 0 #00ff00",
          "-2px 0 0 #ff0000, 2px 0 0 #00ff00",
          "2px 0 0 #ff0000, -2px 0 0 #00ff00",
          "-2px 0 0 #ff0000, 2px 0 0 #00ff00",
          "0 0 0 transparent"
        ]
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.div>
  );
};

// Liquid button effect
interface LiquidButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ 
  children, 
  className = "", 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary to-accent"
        initial={{ scale: 0, borderRadius: "50%" }}
        animate={isHovered ? 
          { scale: 1.5, borderRadius: "0%" } : 
          { scale: 0, borderRadius: "50%" }
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ originX: 0.5, originY: 0.5 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Particle explosion effect
interface ParticleExplosionProps {
  trigger: boolean;
  onComplete?: () => void;
  particleCount?: number;
  className?: string;
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ 
  trigger, 
  onComplete, 
  particleCount = 20,
  className = "" 
}) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    angle: (360 / particleCount) * i,
    distance: Math.random() * 100 + 50,
    size: Math.random() * 4 + 2,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <AnimatePresence>
        {trigger && particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute bg-primary rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: '50%',
              top: '50%',
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{
              x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
              y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut" 
            }}
            onAnimationComplete={() => {
              if (particle.id === 0) onComplete?.();
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Typewriter effect
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  speed = 50, 
  className = "",
  onComplete 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

// Elastic scale animation
interface ElasticScaleProps {
  children: React.ReactNode;
  className?: string;
  trigger?: boolean;
}

export const ElasticScale: React.FC<ElasticScaleProps> = ({ 
  children, 
  className = "",
  trigger = false 
}) => {
  return (
    <motion.div
      className={className}
      animate={trigger ? {
        scale: [1, 1.2, 0.9, 1.1, 1],
      } : { scale: 1 }}
      transition={{
        duration: 0.6,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};
