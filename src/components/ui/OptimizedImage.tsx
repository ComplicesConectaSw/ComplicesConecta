import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import ProfileImagePlaceholder from './ProfileImagePlaceholder';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  placeholderType?: 'single' | 'couple';
  placeholderName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  onLoad,
  onError,
  priority = false,
  sizes,
  width,
  height,
  placeholderType = 'single',
  placeholderName = 'Usuario',
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
    logger.info('Image loaded successfully:', { src: currentSrc });
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      logger.warn('Image failed to load, using fallback:', { original: src, fallback: fallbackSrc });
    } else {
      onError?.();
      logger.error('Image failed to load:', { src: currentSrc });
    }
  };

  if (hasError) {
    return (
      <ProfileImagePlaceholder
        type={placeholderType}
        name={placeholderName}
        className={className}
        iconSize="lg"
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-300",
        isLoading ? "opacity-50" : "opacity-100",
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      width={width}
      height={height}
    />
  );
};

export default OptimizedImage;
