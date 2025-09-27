import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "size">, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  ripple?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    loading = false,
    ripple = true,
    glow = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          "relative overflow-hidden",
          glow && "shadow-lg hover:shadow-xl",
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { 
          scale: 1.02,
          y: -1,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
        } : {}}
        whileTap={!isDisabled ? { 
          scale: 0.98,
          y: 0
        } : {}}
        // Reduce motion for mobile devices
        animate={typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {} : undefined}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        {...props}
      >
        {/* Ripple Effect Background */}
        {ripple && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-md pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ 
              scale: 1, 
              opacity: [0, 0.3, 0],
              transition: { duration: 0.6, ease: "easeOut" }
            }}
          />
        )}

        {/* Glow Effect */}
        {glow && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-md pointer-events-none"
            initial={{ x: "-100%" }}
            whileHover={{ 
              x: "100%",
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
          />
        )}

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mr-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}

        {/* Button Content */}
        <motion.span
          className="relative z-10 flex items-center gap-2"
          animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
        >
          {children}
        </motion.span>

        {/* Pulse Effect for Premium/Love variants */}
        {(variant === "love" || variant === "premium") && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/20 rounded-md pointer-events-none"
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;
