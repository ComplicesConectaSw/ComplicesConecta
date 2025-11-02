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

  // Fallback image - usar un placeholder más robusto (comentado porque se usa directamente en el JSX)
  // const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNzMzNzgwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imqIgSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  const placeholderSrc = '/compliceslogo.png';

  if (hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center border border-purple-400/30 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center justify-center w-full h-full text-white/70">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="text-sm">Imagen no disponible</span>
        </div>
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
