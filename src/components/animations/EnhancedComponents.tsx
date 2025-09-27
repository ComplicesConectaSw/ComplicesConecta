import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { useAnimationVariants } from '@/components/animations/AnimationProvider';
import { MagneticButton, RippleEffect, FloatingElement } from '@/components/animations/InteractiveAnimations';
import { Heart, Star } from 'lucide-react';

// Enhanced Animated Button with multiple effects
interface EnhancedButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'love' | 'hero' | 'premium';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  className?: string;
  onClick?: () => void;
  magnetic?: boolean;
  ripple?: boolean;
  glow?: boolean;
  pulse?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  magnetic = false,
  ripple = false,
  glow = false,
  pulse = false
}) => {
  const variants = useAnimationVariants({
    idle: { scale: 1, boxShadow: '0 0 0 rgba(168, 85, 247, 0)' },
    hover: { 
      scale: 1.05,
      boxShadow: glow ? '0 0 20px rgba(168, 85, 247, 0.4)' : '0 0 0 rgba(168, 85, 247, 0)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  });

  const pulseVariants = pulse ? {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {};

  const ButtonComponent = magnetic ? MagneticButton : motion.div;
  const WrapperComponent = ripple ? RippleEffect : React.Fragment;

  return (
    <WrapperComponent {...(ripple ? { className: 'inline-block' } : {})}>
      <ButtonComponent
        variants={{ ...variants, ...pulseVariants }}
        initial="idle"
        animate={pulse ? "animate" : "idle"}
        whileHover="hover"
        whileTap="tap"
        onClick={onClick}
        className={className}
      >
        <UnifiedButton
          variant={variant}
          size={size}
          className="w-full h-full"
        >
          {children}
        </UnifiedButton>
      </ButtonComponent>
    </WrapperComponent>
  );
};

// Enhanced Animated Card with hover effects
interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover3d?: boolean;
  glow?: boolean;
  float?: boolean;
  onClick?: () => void;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className = '',
  hover3d = false,
  glow = false,
  float = false,
  onClick
}) => {
  const variants = useAnimationVariants({
    initial: { 
      opacity: 0, 
      y: 20,
      rotateX: hover3d ? -10 : 0
    },
    animate: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      y: -5,
      rotateX: hover3d ? 5 : 0,
      rotateY: hover3d ? 5 : 0,
      scale: 1.02,
      boxShadow: glow 
        ? '0 20px 40px rgba(168, 85, 247, 0.2), 0 0 20px rgba(168, 85, 247, 0.1)'
        : '0 20px 40px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3 }
    }
  });

  const CardComponent = float ? FloatingElement : motion.div;

  return (
    <CardComponent
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      className={className}
      style={hover3d ? { perspective: 1000 } : {}}
    >
      <UnifiedCard className="w-full h-full">
        {children}
      </UnifiedCard>
    </CardComponent>
  );
};

// Enhanced Profile Card with advanced animations
interface EnhancedProfileCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    avatar: string;
    bio?: string;
    compatibility?: number;
    distance?: number;
    isOnline?: boolean;
  };
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  className?: string;
}

export const EnhancedProfileCard: React.FC<EnhancedProfileCardProps> = ({
  user,
  onLike,
  onPass,
  onSuperLike,
  className = ''
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  
  const cardVariants = useAnimationVariants({
    front: { rotateY: 0 },
    back: { rotateY: 180 }
  });

  const actionVariants = useAnimationVariants({
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  });

  return (
    <motion.div
      className={`relative w-full h-96 ${className}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        variants={cardVariants}
        animate={isFlipped ? 'back' : 'front'}
        transition={{ duration: 0.6 }}
        className="relative w-full h-full preserve-3d cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden">
          <EnhancedCard hover3d glow className="h-full">
            <div className="relative h-full overflow-hidden rounded-lg">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Online indicator */}
              {user.isOnline && (
                <motion.div
                  className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* User info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold">{user.name}, {user.age}</h3>
                {user.compatibility && (
                  <div className="flex items-center gap-2 mt-1">
                    <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
                    <span className="text-sm">{user.compatibility}% compatible</span>
                  </div>
                )}
                {user.distance && (
                  <p className="text-sm text-gray-300">{user.distance} km away</p>
                )}
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <EnhancedCard className="h-full bg-gradient-to-br from-purple-600 to-pink-600">
            <div className="p-6 h-full flex flex-col justify-between text-white">
              <div>
                <h3 className="text-xl font-bold mb-4">{user.name}</h3>
                <p className="text-sm opacity-90">{user.bio || "No bio available"}</p>
              </div>
              
              <motion.div
                variants={actionVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-center gap-4"
              >
                <EnhancedButton
                  variant="destructive"
                  size="sm"
                  onClick={onPass}
                  ripple
                  className="bg-red-500 hover:bg-red-600"
                >
                  Pass
                </EnhancedButton>
                <EnhancedButton
                  variant="love"
                  size="sm"
                  onClick={onSuperLike}
                  magnetic
                  glow
                  pulse
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  <Star className="w-4 h-4" />
                </EnhancedButton>
                <EnhancedButton
                  variant="secondary"
                  size="sm"
                  onClick={onLike}
                  ripple
                  className="bg-green-500 hover:bg-green-600"
                >
                  Like
                </EnhancedButton>
              </motion.div>
            </div>
          </EnhancedCard>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Chat Message with typing animation
interface EnhancedChatMessageProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    isOwn: boolean;
  };
  showTyping?: boolean;
}

export const EnhancedChatMessage: React.FC<EnhancedChatMessageProps> = ({
  message,
  showTyping = false
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(showTyping);

  React.useEffect(() => {
    if (showTyping && message.content) {
      setIsTyping(true);
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < message.content.length) {
          setDisplayText(message.content.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 50);
      
      return () => clearInterval(typingInterval);
    } else {
      setDisplayText(message.content);
    }
  }, [message.content, showTyping]);

  const messageVariants = useAnimationVariants({
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  });

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.isOwn
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{displayText}</p>
        {isTyping && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-0.5 h-4 bg-current ml-1"
          />
        )}
        <p className={`text-xs mt-1 ${message.isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
          {message.timestamp}
        </p>
      </div>
    </motion.div>
  );
};

// Enhanced Navigation Item with badge animations
interface EnhancedNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
  className?: string;
}

export const EnhancedNavItem: React.FC<EnhancedNavItemProps> = ({
  icon,
  label,
  isActive = false,
  badge,
  onClick,
  className = ''
}) => {
  const itemVariants = useAnimationVariants({
    inactive: { scale: 1, color: '#9CA3AF' },
    active: { 
      scale: 1.1, 
      color: '#A855F7',
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  });

  const badgeVariants = useAnimationVariants({
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }
  });

  return (
    <motion.button
      variants={itemVariants}
      animate={isActive ? 'active' : 'inactive'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-2 ${className}`}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 && (
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {badge > 99 ? '99+' : badge}
          </motion.div>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </motion.button>
  );
};

// Enhanced Loading Spinner with multiple variants
interface EnhancedLoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = '#A855F7',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variants = {
    spinner: (
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-current rounded-full ${className}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ borderTopColor: color }}
      />
    ),
    dots: (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${sizeClasses[size]} rounded-full`}
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    ),
    pulse: (
      <motion.div
        className={`${sizeClasses[size]} rounded-full ${className}`}
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    ),
    wave: (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scaleY: [1, 2, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    )
  };

  return (
    <div className="flex items-center justify-center">
      {variants[variant]}
    </div>
  );
};
