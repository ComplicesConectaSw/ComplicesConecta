import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, generateSrcSet, createLazyLoader, type OptimizedImageProps } from '@/utils/imageOptimization';

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  quality = 85,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generar URLs optimizadas
  const optimizedSrc = optimizeImageUrl(src, { quality, width, height });
  const srcSet = width ? generateSrcSet(src, [width, width * 1.5, width * 2]) : undefined;

  useEffect(() => {
    if (!priority && imgRef.current) {
      // Configurar lazy loading para imágenes no prioritarias
      observerRef.current = createLazyLoader();
      
      if (observerRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Placeholder mientras carga
  const placeholderSrc = '/compliceslogo.png';

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-700 dark:text-gray-200 text-sm">Error al cargar imagen</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Imagen principal */}
      <img
        ref={imgRef}
        src={priority ? optimizedSrc : placeholderSrc}
        srcSet={priority ? srcSet : undefined}
        data-src={priority ? undefined : optimizedSrc}
        data-srcset={priority ? undefined : srcSet}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${!priority ? 'lazy-loading' : ''}
        `}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />

      {/* Skeleton loader */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
