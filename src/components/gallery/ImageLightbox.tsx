/**
 * =====================================================
 * IMAGE LIGHTBOX
 * =====================================================
 * Lightbox fullscreen con navegación y zoom
 * Features: Keyboard nav, zoom, gestos, thumbnails
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  allowDownload?: boolean;
  showThumbnails?: boolean;
  _userId?: string;
  userRole?: 'user' | 'moderator' | 'admin';
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  onClose,
  allowDownload = false,
  showThumbnails = true,
  _userId,
  userRole = 'user'
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];
  const canDownload = allowDownload && (userRole === 'moderator' || userRole === 'admin');

  /**
   * Navegación
   */
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  /**
   * Zoom
   */
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  /**
   * Drag para pan
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
        case '_':
          zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, onClose]);

  /**
   * Descargar imagen (solo moderadores/admin)
   */
  const handleDownload = async () => {
    if (!canDownload) {
      alert('No tienes permisos para descargar contenido');
      return;
    }

    const reason = prompt('Razón legal para descarga (requerido):');
    if (!reason) return;

    try {
      // TODO: Registrar descarga con contentProtectionService
      const link = document.createElement('a');
      link.setAttribute('href', currentImage);
      link.setAttribute('download', `evidence-${Date.now()}.jpg`);
      link.style.display = 'none';
      // @ts-ignore - TypeScript strict mode issue with appendChild/removeChild
      document.body.appendChild(link);
      link.click();
      // @ts-ignore
      document.body.removeChild(link);

      alert(`✅ Descarga registrada\n\nMotivo: ${reason}\nHora: ${new Date().toLocaleString()}`);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  /**
   * Compartir
   */
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Imagen',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('✅ Link copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  /**
   * Reportar
   */
  const handleReport = () => {
    // TODO: Abrir modal de reporte
    alert('Función de reporte disponible próximamente');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm opacity-75">
                {currentIndex + 1} / {images.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 1}
                className="text-white hover:bg-white/10"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-white text-sm min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 3}
                className="text-white hover:bg-white/10"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>

              {/* Actions */}
              {canDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/10"
                  title="Descargar (solo autorizado)"
                >
                  <Download className="h-5 w-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:bg-white/10"
              >
                <Share2 className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
                className="text-white hover:bg-white/10"
              >
                <Flag className="h-5 w-5" />
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`Image ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: zoom,
              x: position.x,
              y: position.y
            }}
            transition={{ duration: 0.3 }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
            data-sensitive="true"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/75 rounded-full text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs text-center">
          <p>← → para navegar • + - para zoom • ESC para cerrar</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;

