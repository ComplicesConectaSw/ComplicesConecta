import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Star, MapPin, Users, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Modal';

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
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showSuperLikeModal, setShowSuperLikeModal] = useState(false);

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
    return "from-purple-400 to-red-500";
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
                src={avatar || images[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face'}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face') {
                    target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {verified && (
                  <Badge className="bg-blue-600 text-white text-xs shadow-lg border border-blue-400">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Verificado
                  </Badge>
                )}
                {accountType === 'couple' && (
                  <Badge className="bg-purple-600 text-white text-xs shadow-lg border border-purple-400">
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
                className="w-14 h-14 rounded-full border-2 border-red-400 bg-red-500/20 hover:border-red-500 hover:bg-red-500/30 shadow-lg"
                onClick={onPass}
              >
                <X className="h-6 w-6 text-red-400" />
              </UnifiedButton>
              
              {onSuperLike && (
                <UnifiedButton
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 rounded-full border-2 border-blue-400 bg-blue-500/20 hover:border-blue-500 hover:bg-blue-500/30 shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSuperLikeModal(true);
                    setTimeout(() => {
                      if (onSuperLike) onSuperLike();
                    }, 100);
                  }}
                  title="Super Like - Destaca tu interés"
                >
                  <Sparkles className="h-6 w-6 text-blue-400" />
                </UnifiedButton>
              )}
              
              <UnifiedButton
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full border-2 border-purple-400 bg-purple-500/20 hover:border-purple-500 hover:bg-purple-500/30 shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowLikeModal(true);
                  setTimeout(() => {
                    if (onLike) onLike();
                  }, 100);
                }}
                title="Me Gusta - Si también te gusta, será un match"
              >
                <Heart className="h-6 w-6 text-purple-400" />
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
              src={avatar || images[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face'}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face') {
                  target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face';
                }
              }}
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
                <Badge className="bg-blue-600 text-white shadow-lg border border-blue-400">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  Verificado
                </Badge>
              )}
              {accountType === 'couple' && (
                <Badge className="bg-purple-600 text-white shadow-lg border border-purple-400">
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
          <div className="p-6 bg-white/10 backdrop-blur-sm flex justify-center gap-6">
            <UnifiedButton
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-2 border-red-400 bg-red-500/20 hover:border-red-500 hover:bg-red-500/30 transition-all duration-200 shadow-lg"
              onClick={onPass}
              title="Pasar este perfil"
            >
              <X className="h-8 w-8 text-red-400" />
            </UnifiedButton>
            
            {onSuperLike && (
              <UnifiedButton
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full border-2 border-blue-400 bg-blue-500/20 hover:border-blue-500 hover:bg-blue-500/30 transition-all duration-200 shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSuperLikeModal(true);
                  // Llamar la función después de un pequeño delay para asegurar que el modal se muestre
                  setTimeout(() => {
                    if (onSuperLike) onSuperLike();
                  }, 100);
                }}
                title="Super Like - Destaca tu interés"
              >
                <Sparkles className="h-8 w-8 text-blue-400" />
              </UnifiedButton>
            )}
            
            <UnifiedButton
              gradient
              size="lg"
              className="w-16 h-16 rounded-full transition-all duration-200 hover:scale-110 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowLikeModal(true);
                // Llamar la función después de un pequeño delay para asegurar que el modal se muestre
                setTimeout(() => {
                  if (onLike) onLike();
                }, 100);
              }}
              title="Me Gusta - Si también te gusta, será un match"
            >
              <Heart className="h-8 w-8 text-white" />
            </UnifiedButton>
          </div>
        </div>
      </UnifiedCard>

      {/* Modal de Me Gusta */}
      <Dialog open={showLikeModal} onOpenChange={setShowLikeModal}>
        <DialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white border-purple-500/30 z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-lg">
              <Heart className="h-6 w-6 text-purple-400" fill="currentColor" />
              ¡Me Gusta Enviado!
            </DialogTitle>
            <DialogDescription className="text-white font-medium drop-shadow-md">
              ¿Qué significa dar "Me Gusta"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-white font-medium leading-relaxed drop-shadow-md">
              Has expresado interés en este perfil. Si <strong className="text-purple-300">{name}</strong> también te da "Me Gusta", 
              ¡será un <strong className="text-blue-300">match</strong>! 💕
            </p>
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-purple-300 drop-shadow-sm">¿Qué sucede ahora?</p>
              <ul className="text-sm text-white font-medium space-y-1 list-disc list-inside drop-shadow-sm">
                <li>La otra persona recibirá una notificación</li>
                <li>Si también te da "Me Gusta", podrán empezar a chatear</li>
                <li>Tu perfil aparecerá en su sección de "Matches"</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Super Like */}
      <Dialog open={showSuperLikeModal} onOpenChange={setShowSuperLikeModal}>
        <DialogContent className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white border-blue-500/30 z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-lg">
              <Sparkles className="h-6 w-6 text-blue-400" />
              ¡Super Like Enviado!
            </DialogTitle>
            <DialogDescription className="text-white font-medium drop-shadow-md">
              Has destacado tu interés de forma especial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-white font-medium leading-relaxed drop-shadow-md">
              Has enviado un <strong className="text-blue-300">Super Like</strong> a <strong className="text-purple-300">{name}</strong>. 
              Esto significa que estás muy interesado/a y destacarás entre otros perfiles. ⭐
            </p>
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-blue-300 drop-shadow-sm">¿Por qué usar Super Like?</p>
              <ul className="text-sm text-white font-medium space-y-1 list-disc list-inside drop-shadow-sm">
                <li>Tu perfil aparecerá destacado en su lista de matches</li>
                <li>Aumenta las probabilidades de que te respondan</li>
                <li>Muestra un interés genuino y especial</li>
                <li>Se usa tokens CMPX para destacar tu perfil</li>
              </ul>
            </div>
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
              <p className="text-xs text-blue-200 font-medium drop-shadow-sm">
                💡 <strong>Tip:</strong> Usa Super Like de forma estratégica en perfiles que realmente te interesan mucho.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
