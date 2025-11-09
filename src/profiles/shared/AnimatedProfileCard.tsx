import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Crown, EyeOff, MapPin, Eye } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { isTouchDevice, getAnimationConfig, addTouchSupport } from "@/utils/mobile";

interface ProfileCardProps {
  id: number;
  name: string;
  age: number;
  location: string;
  image: string;
  images?: string[];
  bio?: string;
  interests?: string[];
  isOnline?: boolean;
  isPremium?: boolean;
  isPrivate?: boolean;
  lastSeen?: string;
  onLike?: (id: number) => void;
  onMessage?: (id: number) => void;
  onViewProfile?: (id: number) => void;
  className?: string;
}

export const AnimatedProfileCard = React.memo<ProfileCardProps>(function AnimatedProfileCard({
  id,
  name,
  age,
  location,
  image,
  images = [],
  bio,
  interests = [],
  isOnline = false,
  isPremium = false,
  isPrivate = false,
  lastSeen,
  onLike,
  onMessage,
  onViewProfile,
  className = ""
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isLiked, setIsLiked] = React.useState(false);

  const allImages = [image, ...images];

  const animationConfig = getAnimationConfig();
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (cardRef.current && isTouchDevice()) {
      addTouchSupport(cardRef.current);
    }
  }, []);

  const handleLike = React.useCallback(() => {
    setIsLiked(!isLiked);
    onLike?.(id);
  }, [isLiked, onLike, id]);

  const nextImage = React.useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = React.useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative group", className)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={animationConfig.enabled ? { y: -4, scale: animationConfig.scale } : {}}
      transition={{ 
        type: "spring", 
        stiffness: animationConfig.stiffness, 
        damping: animationConfig.damping,
        duration: animationConfig.duration
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-white/20 shadow-xl">
        {/* Image Container */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={allImages[currentImageIndex]}
              alt={`${name} - ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Online Status */}
          {isOnline && (
            <motion.div
              className="absolute top-2 left-2 sm:top-3 sm:left-3 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Premium Badge */}
          {isPremium && (
            <motion.div
              className="absolute top-2 right-2 sm:top-3 sm:right-3"
              whileHover={animationConfig.enabled ? { scale: 1.1 } : {}}
              whileTap={animationConfig.enabled ? { scale: 0.95 } : {}}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs sm:text-sm">
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Premium</span>
                <span className="sm:hidden">P</span>
              </Badge>
            </motion.div>
          )}

          {/* Privacy Indicator */}
          {isPrivate && (
            <motion.div
              className="absolute top-10 right-2 sm:top-12 sm:right-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-0.5 sm:p-1">
                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </motion.div>
          )}

          {/* Image Navigation */}
          {allImages.length > 1 && isHovered && (
            <motion.div
              className="absolute inset-0 flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                onClick={prevImage}
                className="flex-1 bg-gradient-to-r from-black/20 to-transparent hover:from-black/40 transition-all duration-300"
                aria-label="Imagen anterior"
              />
              <button
                type="button"
                onClick={nextImage}
                className="flex-1 bg-gradient-to-l from-black/20 to-transparent hover:from-black/40 transition-all duration-300"
                aria-label="Siguiente imagen"
              />
            </motion.div>
          )}

          {/* Image Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex gap-0.5 sm:gap-1">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 touch-manipulation",
                    index === currentImageIndex
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/80 active:bg-white/90"
                  )}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </div>

        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Name and Age */}
          <div className="flex items-center justify-between">
            <motion.h3
              className="text-base sm:text-lg font-bold text-white truncate"
              layoutId={`name-${id}`}
            >
              {name}, {age}
            </motion.h3>
            {!isOnline && lastSeen && (
              <span className="text-xs text-white/60 hidden sm:inline">{lastSeen}</span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-white/80">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{location}</span>
          </div>

          {/* Bio */}
          {bio && (
            <motion.p
              className="text-xs sm:text-sm text-white/90 line-clamp-2 sm:line-clamp-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {bio}
            </motion.p>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {interests.slice(0, 3).map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-white/10 text-white border-white/20 px-1.5 py-0.5"
                >
                  {interest.length > 12 ? `${interest.slice(0, 12)}...` : interest}
                </Badge>
              ))}
              {interests.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/10 text-white border-white/20 px-1.5 py-0.5"
                >
                  +{interests.length - 3}
                </Badge>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="flex gap-1.5 sm:gap-2 pt-1 sm:pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex-1 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation ${
                isLiked
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30'
              }`}
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 ${isLiked ? 'fill-current' : ''}`} />
              </motion.div>
              <span className="hidden sm:inline">Me Gusta</span>
              <span className="sm:hidden">â¤ï¸</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessage?.(id)}
              className="flex-1 bg-white/10 text-white hover:bg-white/20 active:bg-white/30 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Chat</span>
              <span className="sm:hidden">ðŸ’¬</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProfile?.(id)}
              className="bg-white/10 text-white hover:bg-white/20 active:bg-white/30 transition-all duration-300 px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Floating Action on Hover - Hidden on mobile */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -top-2 -right-2 z-10 hidden sm:block"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button
              size="sm"
              onClick={handleLike}
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-lg touch-manipulation ${
                isLiked
                  ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
                  : 'bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800'
              }`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default AnimatedProfileCard;
