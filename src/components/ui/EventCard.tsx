import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Star, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  organizer: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  attendees: number;
  maxAttendees?: number;
  price?: number;
  isPrivate?: boolean;
  isPremium?: boolean;
  tags?: string[];
  onJoin?: () => void;
  onView?: () => void;
  className?: string;
  variant?: 'card' | 'list' | 'featured';
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  date,
  time,
  location,
  image,
  organizer,
  attendees,
  maxAttendees,
  price,
  isPrivate = false,
  isPremium = false,
  tags = [],
  onJoin,
  onView,
  className,
  variant = 'card'
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -4, scale: 1.02 }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getAvailabilityColor = () => {
    if (!maxAttendees) return "text-green-600";
    const percentage = (attendees / maxAttendees) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  if (variant === 'list') {
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
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={image || '/placeholder.svg'}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate pr-2">
                  {title}
                </h3>
                <div className="flex gap-1 flex-shrink-0">
                  {isPrivate && <Lock className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
                  {isPremium && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", getAvailabilityColor())}>
                  <Users className="h-3 w-3 inline mr-1" />
                  {attendees} {maxAttendees && `/ ${maxAttendees}`} asistentes
                </span>
                
                {price !== undefined && (
                  <Badge variant={price === 0 ? "secondary" : "default"}>
                    {price === 0 ? 'Gratis' : `$${price}`}
                  </Badge>
                )}
              </div>
            </div>
            
            <UnifiedButton size="sm" gradient onClick={onJoin}>
              Unirse
            </UnifiedButton>
          </div>
        </UnifiedCard>
      </motion.div>
    );
  }

  if (variant === 'featured') {
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
          <div className="relative h-64">
            <img
              src={image || '/placeholder.svg'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isPremium && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Premium
                </Badge>
              )}
              {isPrivate && (
                <Badge className="bg-gray-800 text-white">
                  <Lock className="h-3 w-3 mr-1" />
                  Privado
                </Badge>
              )}
            </div>
            
            {/* Price */}
            {price !== undefined && (
              <div className="absolute top-4 right-4">
                <Badge className={cn(
                  "text-lg font-bold",
                  price === 0 ? "bg-green-500" : "bg-blue-500"
                )}>
                  {price === 0 ? 'GRATIS' : `$${price}`}
                </Badge>
              </div>
            )}
            
            {/* Event info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-white text-2xl font-bold mb-2">
                {title}
              </h2>
              
              <div className="flex items-center gap-4 text-white/90 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {time}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {description && (
              <p className="text-gray-600 mb-4 line-clamp-2">
                {description}
              </p>
            )}
            
            {/* Organizer */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={organizer.avatar} alt={organizer.name} />
                <AvatarFallback className="text-xs">
                  {organizer.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  Organizado por {organizer.name}
                  {organizer.verified && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                </p>
              </div>
            </div>
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Attendees and action */}
            <div className="flex items-center justify-between">
              <span className={cn("text-sm font-medium", getAvailabilityColor())}>
                <Users className="h-4 w-4 inline mr-1" />
                {attendees} {maxAttendees && `/ ${maxAttendees}`} asistentes
              </span>
              
              <UnifiedButton gradient onClick={onJoin}>
                Unirse al evento
              </UnifiedButton>
            </div>
          </div>
        </UnifiedCard>
      </motion.div>
    );
  }

  // Default card variant
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
            src={image || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isPremium && (
              <Badge className="bg-yellow-500 text-white text-xs">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Premium
              </Badge>
            )}
            {isPrivate && (
              <Badge className="bg-gray-800 text-white text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Privado
              </Badge>
            )}
          </div>
          
          {/* Price */}
          {price !== undefined && (
            <div className="absolute top-3 right-3">
              <Badge className={cn(
                "font-semibold",
                price === 0 ? "bg-green-500" : "bg-blue-500"
              )}>
                {price === 0 ? 'GRATIS' : `$${price}`}
              </Badge>
            </div>
          )}
          
          {/* Date overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-xs font-medium text-gray-600">
                {formatDate(date).split(' ')[1]}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatDate(date).split(' ')[0]}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {title}
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-medium", getAvailabilityColor())}>
              <Users className="h-3 w-3 inline mr-1" />
              {attendees} asistentes
            </span>
            
            <UnifiedButton size="sm" gradient onClick={onJoin}>
              Unirse
            </UnifiedButton>
          </div>
        </div>
      </UnifiedCard>
    </motion.div>
  );
};
