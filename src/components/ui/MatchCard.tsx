import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Star, MapPin, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  id: string;
  name: string;
  age: number;
  bio?: string;
  location?: string;
  avatar?: string;
  images?: string[];
  distance?: number;
  compatibility: number;
  reasons?: string[];
  verified?: boolean;
  accountType?: 'single' | 'couple';
  onLike: () => void;
  onPass: () => void;
  onSuperLike?: () => void;
  className?: string;
  variant?: 'swipe' | 'grid';
}

export const MatchCard: React.FC<MatchCardProps> = ({
  id: _id,
  name,
  age,
  bio,
  location,
  avatar,
  images = [],
  distance,
  compatibility,
  reasons = [],
  verified = false,
  accountType = 'single',
  onLike,
  onPass,
  onSuperLike,
  className,
  variant = 'swipe'
}) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      rotateY: 30,
      transition: { duration: 0.3 }
    }
  };

  const getCompatibilityColor = () => {
    if (compatibility >= 80) return "from-green-400 to-emerald-500";
    if (compatibility >= 60) return "from-yellow-400 to-orange-500";
    return "from-pink-400 to-red-500";
  };

  const getDistanceText = () => {
    if (!distance) return null;
    if (distance <= 5) return "Muy cerca de ti";
    if (distance <= 15) return "En tu zona";
    return `${distance}km`;
  };

  if (variant === 'grid') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={cn("w-full max-w-sm", className)}
      >
        <UnifiedCard glass hover className="overflow-hidden">
          <div className="relative">
            <div className="aspect-[3/4] relative">
              <img
                src={avatar || images[0] || '/compliceslogo.png'}
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {verified && (
                  <Badge className="bg-blue-500 text-white text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Verificado
                  </Badge>
                )}
                {accountType === 'couple' && (
                  <Badge className="bg-purple-500 text-white text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Pareja
                  </Badge>
                )}
              </div>
              
              {/* Compatibility */}
              <div className="absolute top-3 right-3">
                <div className={cn(
                  "px-3 py-1 rounded-full text-white text-sm font-semibold",
                  "bg-gradient-to-r shadow-lg",
                  getCompatibilityColor()
                )}>
                  {compatibility}%
                </div>
              </div>
              
              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-xl font-bold mb-1">
                  {name}, {age}
                </h3>
                
                {location && (
                  <p className="text-white/90 text-sm flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    {location} {distance && `• ${getDistanceText()}`}
                  </p>
                )}
                
                {bio && (
                  <p className="text-white/80 text-sm line-clamp-2 mb-3">
                    {bio}
                  </p>
                )}
                
                {/* Reasons */}
                {reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {reasons.slice(0, 2).map((reason, index) => (
                      <Badge key={index} className="bg-white/20 text-white text-xs backdrop-blur-sm">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-4 flex justify-center gap-4">
              <UnifiedButton
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50"
                onClick={onPass}
              >
                <X className="h-6 w-6 text-gray-600 hover:text-red-500" />
              </UnifiedButton>
              
              {onSuperLike && (
                <UnifiedButton
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 rounded-full border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                  onClick={onSuperLike}
                >
                  <Sparkles className="h-6 w-6 text-blue-500" />
                </UnifiedButton>
              )}
              
              <UnifiedButton
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50"
                onClick={onLike}
              >
                <Heart className="h-6 w-6 text-pink-500" />
              </UnifiedButton>
            </div>
          </div>
        </UnifiedCard>
      </motion.div>
    );
  }

  // Swipe variant (default)
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn("w-full max-w-sm mx-auto", className)}
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          onLike();
        } else if (info.offset.x < -100) {
          onPass();
        }
      }}
    >
      <UnifiedCard glass className="overflow-hidden cursor-grab active:cursor-grabbing">
        <div className="relative">
          <div className="aspect-[3/4] relative">
            <img
              src={avatar || images[0] || '/compliceslogo.png'}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Swipe indicators */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
            >
              <div className="text-6xl font-bold text-green-500 transform rotate-12 opacity-0">
                LIKE
              </div>
            </motion.div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {verified && (
                <Badge className="bg-blue-500 text-white">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  Verificado
                </Badge>
              )}
              {accountType === 'couple' && (
                <Badge className="bg-purple-500 text-white">
                  <Users className="h-4 w-4 mr-1" />
                  Pareja
                </Badge>
              )}
            </div>
            
            {/* Compatibility score */}
            <div className="absolute top-4 right-4">
              <motion.div
                className={cn(
                  "px-4 py-2 rounded-full text-white font-bold text-lg shadow-lg",
                  "bg-gradient-to-r",
                  getCompatibilityColor()
                )}
                whileHover={{ scale: 1.1 }}
              >
                {compatibility}%
              </motion.div>
            </div>
            
            {/* Main info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-white text-3xl font-bold mb-2">
                  {name}, {age}
                </h2>
                
                {location && (
                  <p className="text-white/90 flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    {location} {distance && `• ${getDistanceText()}`}
                  </p>
                )}
                
                {bio && (
                  <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3">
                    {bio}
                  </p>
                )}
                
                {/* Match reasons */}
                {reasons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm font-medium">
                      ¿Por qué es un match?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {reasons.slice(0, 3).map((reason, index) => (
                        <Badge key={index} className="bg-white/20 text-white backdrop-blur-sm">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="p-6 bg-white flex justify-center gap-6">
            <UnifiedButton
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
              onClick={onPass}
            >
              <X className="h-8 w-8 text-gray-600 hover:text-red-500" />
            </UnifiedButton>
            
            {onSuperLike && (
              <UnifiedButton
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                onClick={onSuperLike}
              >
                <Sparkles className="h-8 w-8 text-blue-500" />
              </UnifiedButton>
            )}
            
            <UnifiedButton
              gradient
              size="lg"
              className="w-16 h-16 rounded-full transition-all duration-200 hover:scale-110"
              onClick={onLike}
            >
              <Heart className="h-8 w-8 text-white" />
            </UnifiedButton>
          </div>
        </div>
      </UnifiedCard>
    </motion.div>
  );
};
