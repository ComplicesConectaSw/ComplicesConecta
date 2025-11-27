import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';

interface LazyImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  webpSrc?: string;
  avifSrc?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImageLoader: React.FC<LazyImageLoaderProps> = ({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  webpSrc,
  avifSrc,
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detectar soporte para formatos modernos
  const supportsWebP = useRef<boolean | null>(null);
  const supportsAVIF = useRef<boolean | null>(null);

  useEffect(() => {
    // Detectar soporte WebP
    if (supportsWebP.current === null) {
      const webpTest = new Image();
      webpTest.onload = webpTest.onerror = () => {
        supportsWebP.current = webpTest.height === 2;
      };
      webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    // Detectar soporte AVIF
    if (supportsAVIF.current === null) {
      const avifTest = new Image();
      avifTest.onload = avifTest.onerror = () => {
        supportsAVIF.current = avifTest.height === 2;
      };
      avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    }
  }, []);

  useEffect(() => {
    if (!imgRef.current) return;

    // Intersection Observer para lazy loading
    if (loading === 'lazy') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observerRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '50px' // Cargar 50px antes de ser visible
        }
      );

      observerRef.current.observe(imgRef.current as Element);
    } else {
      loadImage();
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, webpSrc, avifSrc]);

  const loadImage = () => {
    // Seleccionar la mejor fuente disponible
    let selectedSrc = src;
    
    if (supportsAVIF.current && avifSrc) {
      selectedSrc = avifSrc;
    } else if (supportsWebP.current && webpSrc) {
      selectedSrc = webpSrc;
    }

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(selectedSrc);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      // Fallback a formato original si falla
      if (selectedSrc !== src) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCurrentSrc(src);
          setIsLoaded(true);
          setHasError(false);
          onLoad?.();
        };
        fallbackImg.onerror = () => {
          setHasError(true);
          onError?.();
        };
        fallbackImg.src = src;
      } else {
        setHasError(true);
        onError?.();
      }
    };
    
    img.src = selectedSrc;
  };

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          'img-android transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'opacity-50',
          className
        )}
        loading={loading}
        decoding="async"
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Error al cargar</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImageLoader;
