import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, MessageCircle, Heart, Star, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  location?: string;
  avatar?: string;
  images?: string[];
  isOnline?: boolean;
  verified?: boolean;
  accountType?: 'single' | 'couple';
  interests?: string[];
  distance?: number;
  compatibility?: number;
  onMessage?: () => void;
  onLike?: () => void;
  onView?: () => void;
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  age,
  bio,
  location,
  avatar,
  images = [],
  isOnline = false,
  verified = false,
  accountType = 'single',
  interests = [],
  distance,
  compatibility,
  onMessage,
  onLike,
  onView,
  className,
  variant = 'detailed'
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -8, scale: 1.02 }
  };

  const getDistanceText = () => {
    if (!distance) return null;
    if (distance <= 5) return "Muy cerca de ti";
    if (distance <= 15) return "En tu zona";
    return `${distance}km de distancia`;
  };

  const getCompatibilityColor = () => {
    if (!compatibility) return "text-gray-500";
    if (compatibility >= 80) return "text-green-500";
    if (compatibility >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={cn("cursor-pointer", className)}
        onClick={onView}
      >
        <UnifiedCard glass hover className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {name} {age && `, ${age}`}
                </h3>
                {verified && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              </div>
              {location && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              )}
            </div>
            
            <UnifiedButton size="sm" variant="ghost" onClick={onMessage}>
              <MessageCircle className="h-4 w-4" />
            </UnifiedButton>
          </div>
        </UnifiedCard>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={cn("cursor-pointer", className)}
        onClick={onView}
      >
        <UnifiedCard glass hover className="overflow-hidden">
          <div className="relative h-48">
            <img
              src={avatar || images[0] || '/placeholder.svg'}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status indicators */}
            <div className="absolute top-3 left-3 flex gap-2">
              {isOnline && (
                <Badge className="bg-green-500 text-white text-xs">
                  En línea
                </Badge>
              )}
              {verified && (
                <Badge className="bg-blue-500 text-white text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
            
            {/* Distance */}
            {distance && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/50 text-white text-xs">
                  {getDistanceText()}
                </Badge>
              </div>
            )}
            
            {/* Bottom info */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-semibold text-lg">
                {name} {age && `, ${age}`}
              </h3>
              {location && (
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              )}
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              {compatibility && (
                <div className="flex items-center gap-1">
                  <Heart className={cn("h-4 w-4", getCompatibilityColor())} />
                  <span className={cn("text-sm font-medium", getCompatibilityColor())}>
                    {compatibility}% compatible
                  </span>
                </div>
              )}
              
              <div className="flex gap-2">
                <UnifiedButton size="sm" variant="ghost" onClick={onLike}>
                  <Heart className="h-4 w-4" />
                </UnifiedButton>
                <UnifiedButton size="sm" gradient onClick={onMessage}>
                  <MessageCircle className="h-4 w-4" />
                </UnifiedButton>
              </div>
            </div>
          </div>
        </UnifiedCard>
      </motion.div>
    );
  }

  // Detailed variant (default)
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn("cursor-pointer", className)}
      onClick={onView}
    >
      <UnifiedCard glass hover className="overflow-hidden">
        {/* Header with image */}
        <div className="relative h-64">
          <img
            src={avatar || images[0] || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status indicators */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isOnline && (
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                En línea
              </Badge>
            )}
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
          
          {/* Distance and compatibility */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            {distance && (
              <Badge className="bg-black/50 text-white">
                <MapPin className="h-3 w-3 mr-1" />
                {getDistanceText()}
              </Badge>
            )}
            {compatibility && (
              <Badge className={cn("text-white", getCompatibilityColor())}>
                <Heart className="h-3 w-3 mr-1" />
                {compatibility}%
              </Badge>
            )}
          </div>
          
          {/* Name overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-white text-2xl font-bold">
              {name} {age && `, ${age}`}
            </h2>
            {location && (
              <p className="text-white/90 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Bio */}
          {bio && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Acerca de mí</h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {bio}
              </p>
            </div>
          )}
          
          {/* Interests */}
          {interests.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Intereses</h3>
              <div className="flex flex-wrap gap-2">
                {interests.slice(0, 4).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {interests.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{interests.length - 4} más
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <UnifiedButton
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
            >
              <Heart className="h-4 w-4 mr-2" />
              Me gusta
            </UnifiedButton>
            <UnifiedButton
              gradient
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.();
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Mensaje
            </UnifiedButton>
          </div>
        </div>
      </UnifiedCard>
    </motion.div>
  );
};
