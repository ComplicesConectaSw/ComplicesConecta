import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { Loader2 } from 'lucide-react';

interface UnifiedButtonProps extends Omit<ButtonProps, 'asChild'> {
  gradient?: boolean;
  ripple?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  children,
  className,
  gradient = false,
  ripple = false,
  loading = false,
  loadingText = "Cargando...",
  disabled,
  ...props
}) => {
  const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setRippleEffect({ x, y, show: true });
      
      setTimeout(() => {
        setRippleEffect(prev => ({ ...prev, show: false }));
      }, 600);
    }
    
    if (props.onClick && !loading && !disabled) {
      props.onClick(e);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        {...props}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          gradient && [
            "bg-gradient-to-r from-pink-500 to-purple-600",
            "hover:from-pink-600 hover:to-purple-700",
            "text-white border-0"
          ],
          className
        )}
      >
        {/* Contenido del botón */}
        <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>

        {/* Loading state */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText}
          </span>
        )}

        {/* Ripple effect */}
        {ripple && rippleEffect.show && (
          <motion.span
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: rippleEffect.x - 25,
              top: rippleEffect.y - 25,
              width: 50,
              height: 50,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </Button>
    </motion.div>
  );
};
