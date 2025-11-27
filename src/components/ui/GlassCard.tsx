import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/shared/lib/cn";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "frosted" | "minimal" | "colored";
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: number;
  gradient?: boolean;
  border?: boolean;
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-white/10 border-white/20",
  frosted: "bg-white/20 border-white/30",
  minimal: "bg-white/5 border-white/10",
  colored: "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-white/20"
};

const blurStyles = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl"
};

const shadowStyles = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl"
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className,
    variant = "default",
    blur = "md",
    opacity = 0.1,
    gradient = false,
    border = true,
    shadow = "lg",
    children,
    style,
    ...props 
  }, ref) => {
    const customOpacity = opacity !== 0.1 ? { backgroundColor: `rgba(255, 255, 255, ${opacity})` } : {};
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl",
          blurStyles[blur],
          shadowStyles[shadow],
          border && "border",
          gradient ? "bg-gradient-to-br from-white/10 to-white/5" : variantStyles[variant],
          className
        )}
        style={{ ...customOpacity, ...style }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches ? { y: -2, scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 25 } } : {}}
        transition={{ 
          duration: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.3, 
          ease: "easeOut" 
        }}
        {...props}
      >
        {/* Animated Border Gradient */}
        {border && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
              padding: "1px"
            }}
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-full h-full rounded-xl bg-transparent" />
          </motion.div>
        )}

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
