import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/components/ui/label';
import { cn } from '@/shared/lib/cn';
import { Eye, EyeOff } from 'lucide-react';

interface UnifiedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  animated?: boolean;
  glass?: boolean;
}

export const UnifiedInput = forwardRef<HTMLInputElement, UnifiedInputProps>(({
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  animated = true,
  glass = false,
  className,
  type,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputVariants = {
    initial: { scale: 1 },
    focus: { scale: 1.02 },
    error: { x: [-10, 10, -10, 10, 0] }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label 
          className={cn(
            "text-sm font-medium transition-colors",
            error ? "text-red-600" : success ? "text-green-600" : "text-gray-700"
          )}
        >
          {label}
        </Label>
      )}
      
      <motion.div
        variants={animated ? inputVariants : undefined}
        animate={error ? "error" : isFocused ? "focus" : "initial"}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <Input
          ref={ref}
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "transition-all duration-200",
            leftIcon && "pl-10",
            (rightIcon || isPassword) && "pr-10",
            glass && [
              "bg-white/80 backdrop-blur-sm border-white/30",
              "focus:bg-white/90 focus:border-white/50"
            ],
            error && "border-red-300 focus:border-red-500 focus:ring-red-200",
            success && "border-green-300 focus:border-green-500 focus:ring-green-200",
            isFocused && "shadow-md",
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

UnifiedInput.displayName = "UnifiedInput";
