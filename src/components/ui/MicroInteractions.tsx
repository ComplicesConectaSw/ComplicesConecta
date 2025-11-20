/**
 * =====================================================
 * MICRO-INTERACTIONS & UI ENHANCEMENTS
 * =====================================================
 * Componentes de UI con animaciones sutiles
 * Features: Hover effects, loading, tooltips
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Send, Check, X, Loader2 } from 'lucide-react';

/**
 * ========================================
 * ANIMATED BUTTON WITH RIPPLE EFFECT
 * ========================================
 */
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples([...ripples, { x, y, id: Date.now() }]);

    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);

    onClick?.();
  };

  const variantClasses = {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-colors
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${(disabled || loading) && 'opacity-50 cursor-not-allowed'}
        flex items-center gap-2 justify-center
      `}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && icon}
      {children}
    </motion.button>
  );
};

/**
 * ========================================
 * LIKE BUTTON WITH HEART ANIMATION
 * ========================================
 */
interface LikeButtonProps {
  isLiked: boolean;
  onToggle: () => void;
  count?: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  onToggle,
  count
}) => {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 1.2 }}
      className="flex items-center gap-2 group"
    >
      <motion.div
        animate={{
          scale: isLiked ? [1, 1.3, 1] : 1
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`h-6 w-6 transition-colors ${
            isLiked
              ? 'fill-red-500 text-red-500'
              : 'text-gray-400 group-hover:text-red-500'
          }`}
        />
      </motion.div>
      {count !== undefined && (
        <motion.span
          key={count}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-sm font-medium ${
            isLiked ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
};

/**
 * ========================================
 * STAR RATING WITH ANIMATION
 * ========================================
 */
interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  max?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  max = 5
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hover || value);

        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => !readonly && onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHover(starValue)}
            onMouseLeave={() => !readonly && setHover(0)}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            disabled={readonly}
            className={readonly ? 'cursor-default' : 'cursor-pointer'}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

/**
 * ========================================
 * TOOLTIP WITH SMOOTH ANIMATION
 * ========================================
 */
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg
            whitespace-nowrap pointer-events-none
            ${positions[position]}
          `}
        >
          {content}
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 rotate-45
              ${position === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'}
              ${position === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'}
              ${position === 'left' && 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2'}
              ${position === 'right' && 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'}
            `}
          />
        </motion.div>
      )}
    </div>
  );
};

/**
 * ========================================
 * SEND BUTTON WITH ANIMATION
 * ========================================
 */
interface SendButtonProps {
  onSend: () => void;
  disabled?: boolean;
  success?: boolean;
}

export const SendButton: React.FC<SendButtonProps> = ({
  onSend,
  disabled = false,
  success = false
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    await onSend();
    setTimeout(() => setIsSending(false), 1000);
  };

  return (
    <motion.button
      onClick={handleSend}
      disabled={disabled || isSending}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        p-3 rounded-full transition-colors
        ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}
      `}
    >
      <motion.div
        animate={{
          rotate: isSending ? 360 : 0,
          scale: success ? [1, 1.3, 1] : 1
        }}
        transition={{ duration: 0.5 }}
      >
        {success ? (
          <Check className="h-5 w-5 text-white" />
        ) : isSending ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Send className="h-5 w-5 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
};

/**
 * ========================================
 * LOADING SKELETON
 * ========================================
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
};

/**
 * ========================================
 * PROFILE CARD SKELETON
 * ========================================
 */
export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="border rounded-xl p-4 space-y-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

/**
 * ========================================
 * TOGGLE SWITCH WITH ANIMATION
 * ========================================
 */
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled,
  onChange,
  label
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      {label && <span className="text-sm font-medium">{label}</span>}
      <div
        onClick={() => onChange(!enabled)}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${enabled ? 'bg-purple-500' : 'bg-gray-300'}
        `}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
        />
      </div>
    </label>
  );
};

/**
 * ========================================
 * NOTIFICATION BADGE
 * ========================================
 */
interface NotificationBadgeProps {
  count: number;
  max?: number;
  pulse?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  pulse = true
}) => {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold
        rounded-full h-5 min-w-5 flex items-center justify-center px-1
        ${pulse && 'animate-pulse'}
      `}
    >
      {displayCount}
    </motion.div>
  );
};

/**
 * ========================================
 * FLOATING ACTION BUTTON
 * ========================================
 */
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  label
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
    >
      <motion.div
        animate={{ width: isHovered && label ? 'auto' : 56 }}
        className="flex items-center justify-center gap-2 px-4 py-4"
      >
        {icon}
        {isHovered && label && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="text-sm font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </motion.button>
  );
};

/**
 * ========================================
 * SUCCESS/ERROR TOAST
 * ========================================
 */
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose
}) => {
  const icons = {
    success: <Check className="h-5 w-5" />,
    error: <X className="h-5 w-5" />,
    info: <Send className="h-5 w-5" />
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg
        flex items-center gap-3 max-w-md
      `}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
