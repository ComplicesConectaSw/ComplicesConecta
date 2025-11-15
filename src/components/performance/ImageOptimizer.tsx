/**
 * Componente optimizado para imágenes con soporte WebP/AVIF y lazy loading
 * Consolida funcionalidad existente sin romper lógica de negocio
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  supportsWebP, 
  supportsAVIF, 
  optimizeImageUrl, 
  generateSrcSet,
  createLazyLoader,
  preloadImage,
  type ImageOptimizationOptions,
  type OptimizedImageProps
} from '@/utils/imageOptimization';
import { logger } from '@/lib/logger';

interface ImageOptimizerProps extends OptimizedImageProps {
  fallbackSrc?: string;
  placeholder?: string;
  lazy?: boolean;
  preload?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Hook para detectar soporte de formatos modernos
const useModernImageSupport = () => {
  const [support, setSupport] = useState({
    webp: false,
    avif: false,
    loading: true
  });

  useEffect(() => {
    const checkSupport = async () => {
      try {
        const [webpSupported, avifSupported] = await Promise.all([
          supportsWebP(),
          supportsAVIF()
        ]);
        
        setSupport({
          webp: webpSupported,
          avif: avifSupported,
          loading: false
        });
        
        logger.info('🖼️ Soporte de formatos de imagen detectado', {
          webp: webpSupported,
          avif: avifSupported
        });
      } catch (error) {
        logger.warn('⚠️ Error detectando soporte de formatos', { error });
        setSupport(prev => ({ ...prev, loading: false }));
      }
    };

    checkSupport();
  }, []);

  return support;
};

// Componente principal optimizado
export const OptimizedImage: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  quality = 85,
  fallbackSrc,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcmdhbmRvLi4uPC90ZXh0Pjwvc3ZnPg==',
  lazy = true,
  preload: shouldPreload = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const { webp, avif, loading: formatLoading } = useModernImageSupport();

  // Determinar el mejor formato disponible
  const getBestFormat = (): 'avif' | 'webp' | 'jpeg' => {
    if (avif) return 'avif';
    if (webp) return 'webp';
    return 'jpeg';
  };

  // Generar URLs optimizadas
  const generateOptimizedUrls = (baseSrc: string) => {
    const format = getBestFormat();
    const options: ImageOptimizationOptions = {
      quality,
      format,
      width,
      height
    };

    return {
      optimized: optimizeImageUrl(baseSrc, options),
      fallback: optimizeImageUrl(baseSrc, { ...options, format: 'jpeg' })
    };
  };

  // Precargar imagen si es necesario
  useEffect(() => {
    if (shouldPreload && !formatLoading && src) {
      const { optimized } = generateOptimizedUrls(src);
      preloadImage(optimized, { quality, width, height })
        .then(() => {
          logger.info('✅ Imagen precargada', { src: optimized });
        })
        .catch((error) => {
          logger.warn('⚠️ Error precargando imagen', { src: optimized, error });
        });
    }
  }, [shouldPreload, formatLoading, src, quality, width, height]);

  // Configurar lazy loading
  useEffect(() => {
    if (!lazy || priority || !imgRef.current || formatLoading) {
      return;
    }

    observerRef.current = createLazyLoader();
    
    if (observerRef.current && imgRef.current) {
      observerRef.current.observe(imgRef.current as Element);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, formatLoading]);

  // Cargar imagen cuando sea necesario
  useEffect(() => {
    if (formatLoading || !src) return;

    const shouldLoadImmediately = priority || !lazy;
    
    if (shouldLoadImmediately) {
      loadImage();
    }
  }, [formatLoading, src, priority, lazy]);

  const loadImage = async () => {
    if (!src) return;

    try {
      const { optimized, fallback } = generateOptimizedUrls(src);
      
      // Intentar cargar formato optimizado primero
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = optimized;
        });
        
        setCurrentSrc(optimized);
        logger.info('✅ Imagen optimizada cargada', { src: optimized });
      } catch {
        // Fallback a JPEG si falla el formato moderno
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = fallback;
        });
        
        setCurrentSrc(fallback);
        logger.info('📷 Fallback JPEG cargado', { src: fallback });
      }
      
      setIsLoaded(true);
      onLoad?.();
    } catch (error) {
      logger.error('❌ Error cargando imagen', { src, error });
      
      // Usar fallback si está disponible
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setIsLoaded(true);
      } else {
        setHasError(true);
      }
      
      onError?.(error as Error);
    }
  };

  // Generar srcSet para responsive images
  const generateResponsiveSrcSet = () => {
    if (!src || !width) return undefined;
    
    const { optimized } = generateOptimizedUrls(src);
    const widths = [width, width * 1.5, width * 2].map(w => Math.round(w));
    
    return generateSrcSet(optimized, widths);
  };

  // Clases CSS para estados
  const getImageClasses = () => {
    const baseClasses = className;
    const stateClasses = [
      !isLoaded && 'opacity-0',
      isLoaded && 'opacity-100 transition-opacity duration-300',
      lazy && !isLoaded && 'lazy-loading',
      lazy && isLoaded && 'lazy-loaded'
    ].filter(Boolean).join(' ');
    
    return `${baseClasses} ${stateClasses}`.trim();
  };

  // Renderizar placeholder de error
  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <div className="mb-2">⚠️</div>
          <div>Error cargando imagen</div>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      srcSet={isLoaded ? generateResponsiveSrcSet() : undefined}
      alt={alt}
      width={width}
      height={height}
      className={getImageClasses()}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      data-src={lazy && !priority ? src : undefined}
      onLoad={() => {
        if (!isLoaded) {
          setIsLoaded(true);
          onLoad?.();
        }
      }}
      onError={(_e) => {
        if (!hasError) {
          setHasError(true);
          onError?.(new Error('Image load failed'));
        }
      }}
    />
  );
};

// Componente para avatar optimizado (caso común en perfiles)
export const OptimizedAvatar: React.FC<{
  src: string;
  alt: string;
  size?: number;
  className?: string;
  fallback?: string;
}> = ({ 
  src, 
  alt, 
  size = 40, 
  className = '', 
  fallback 
}) => {
  const avatarFallback = fallback || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&size=${size}&background=6366f1&color=ffffff`;
  
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      fallbackSrc={avatarFallback}
      quality={90}
      priority={size >= 100} // Avatares grandes tienen prioridad
    />
  );
};

// Componente para imágenes de perfil (caso específico de ComplicesConecta)
export const ProfileImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}> = ({ 
  src, 
  alt, 
  width = 300, 
  height = 400, 
  className = '', 
  priority = false 
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover rounded-lg ${className}`}
      quality={85}
      priority={priority}
      lazy={!priority}
    />
  );
};

// Hook para precargar múltiples imágenes
export const useImagePreloader = (images: string[]) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const preloadImages = async () => {
    if (images.length === 0) return;
    
    setIsLoading(true);
    setLoadedCount(0);
    
    logger.info('🚀 Iniciando precarga de imágenes', { count: images.length });
    
    const promises = images.map(async (src, index) => {
      try {
        await preloadImage(src);
        setLoadedCount(prev => prev + 1);
        logger.info(`✅ Imagen ${index + 1}/${images.length} precargada`, { src });
      } catch (error) {
        logger.warn(`⚠️ Error precargando imagen ${index + 1}`, { src, error });
      }
    });
    
    await Promise.allSettled(promises);
    setIsLoading(false);
    
    logger.info('🏁 Precarga de imágenes completada', { 
      total: images.length, 
      loaded: loadedCount 
    });
  };

  return {
    preloadImages,
    loadedCount,
    isLoading,
    progress: images.length > 0 ? (loadedCount / images.length) * 100 : 0
  };
};

export default OptimizedImage;
