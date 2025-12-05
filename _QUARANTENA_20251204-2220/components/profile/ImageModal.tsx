import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Baby } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageData {
  id: string;
  url: string;
  caption: string;
  likes: number;
  userLiked: boolean;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageData[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onLike: (imageId: string) => void;
  onComment: (imageId: string, comment: string) => void;
  isParentalLocked?: boolean;
  onToggleParental?: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  onLike,
  onComment,
  isParentalLocked = false,
  onToggleParental
}) => {
  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate('prev');
    if (e.key === 'ArrowRight') onNavigate('next');
  };

  const handleComment = () => {
    const comment = prompt('Añadir comentario:');
    if (comment) {
      onComment(currentImage.id, comment);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Botón cerrar */}
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2"
            size="sm"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Botón control parental */}
          {onToggleParental && (
            <Button
              onClick={onToggleParental}
              className="absolute top-4 left-4 z-10 bg-orange-600/80 hover:bg-orange-700/80 text-white p-2"
              size="sm"
            >
              <Baby className="w-4 h-4" />
            </Button>
          )}

          {/* Navegación izquierda */}
          {images.length > 1 && (
            <Button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3"
              size="sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {/* Navegación derecha */}
          {images.length > 1 && (
            <Button
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3"
              size="sm"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}

          {/* Contenedor principal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-4xl max-h-[90vh] w-full mx-4"
          >
            {/* Imagen */}
            <div className="relative">
              <img
                src={currentImage.url}
                alt={currentImage.caption}
                className={`w-full h-auto max-h-[70vh] object-contain rounded-lg ${
                  isParentalLocked ? 'filter blur-lg' : ''
                }`}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />

              {/* Marca de agua */}
              {!isParentalLocked && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                    ComplicesConecta
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                    © Privado
                  </div>
                </div>
              )}

              {/* Overlay de bloqueo parental */}
              {isParentalLocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Baby className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Contenido Bloqueado</p>
                    <p className="text-sm opacity-70">Control parental activado</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información de la imagen */}
            <div className="bg-black/80 text-white p-4 rounded-b-lg">
              {/* Caption */}
              <p className="text-lg font-medium mb-3">{currentImage.caption}</p>

              {/* Controles de interacción */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Like */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onLike(currentImage.id)}
                    className="flex items-center gap-2 text-white hover:text-pink-400 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        currentImage.userLiked ? 'fill-pink-400 text-pink-400' : ''
                      }`}
                    />
                    <span>{currentImage.likes}</span>
                  </motion.button>

                  {/* Comentario */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleComment}
                    className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Comentar</span>
                  </motion.button>
                </div>

                {/* Indicador de posición */}
                {images.length > 1 && (
                  <div className="flex items-center gap-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

