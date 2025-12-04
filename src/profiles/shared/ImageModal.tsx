import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onLike?: (imageIndex: number) => void;
  onComment?: (imageIndex: number) => void;
  likes?: { [key: number]: number };
  userLikes?: { [key: number]: boolean };
  isPrivate?: boolean;
}

export const ImageModal = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  onLike,
  onComment,
  likes = {},
  userLikes = {},
  isPrivate = false
}: ImageModalProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, images.length, onNavigate, onClose]);

  const handleLike = () => {
    if (onLike) onLike(currentIndex);
  };

  const handleComment = () => {
    if (onComment) onComment(currentIndex);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900/95 via-black/90 to-blue-900/95 backdrop-blur-xl"
        onClick={onClose}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/30 hover:scale-110 transition-all shadow-lg"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/30 hover:scale-110 transition-all shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex - 1);
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {currentIndex < images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/30 hover:scale-110 transition-all shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex + 1);
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Main image */}
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`Imagen ${currentIndex + 1}`}
              className={`w-full h-full object-contain rounded-lg ${
                isPrivate ? 'private-image-protection select-none pointer-events-none' : ''
              }`}
            />

            {/* Watermark for private images */}
            {isPrivate && (
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm border border-white/20 shadow-lg">
                ComplicesConecta © Privado
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute bottom-4 left-4 flex gap-2 bg-black/40 backdrop-blur-md rounded-lg p-2 border border-white/10">
              {onLike && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white bg-white/10 backdrop-blur-sm hover:bg-white/30 ${
                    userLikes[currentIndex] ? 'text-red-500' : ''
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 mr-1 ${userLikes[currentIndex] ? 'fill-current' : ''}`} />
                  {likes[currentIndex] || 0}
                </Button>
              )}

              {onComment && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white bg-white/10 backdrop-blur-sm hover:bg-white/30"
                  onClick={handleComment}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Comentar
                </Button>
              )}
            </div>
          </motion.div>

          {/* Image indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
            {images.map((_, index) => (
              <button
                key={index}
                title={`Ver imagen ${index + 1}`}
                aria-label={`Ir a imagen ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(index);
                }}
              />
            ))}
          </div>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

