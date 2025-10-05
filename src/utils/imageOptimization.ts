// Utilidades para optimización de imágenes - ComplicesConecta v2.9.0

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
}

// Detectar soporte de formatos modernos
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

export const supportsAVIF = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
};

// Generar srcset para diferentes densidades
export const generateSrcSet = (baseSrc: string, widths: number[]): string => {
  return widths
    .map(width => {
      const optimizedSrc = optimizeImageUrl(baseSrc, { width });
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
};

// Optimizar URL de imagen
export const optimizeImageUrl = (
  src: string, 
  options: ImageOptimizationOptions = {}
): string => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const {
    quality = 85,
    format = 'webp',
    width,
    height
  } = options;

  // Para imágenes locales, agregar parámetros de optimización
  if (src.startsWith('/') || src.startsWith('./')) {
    if (typeof window === 'undefined') return src;
    const url = new URL(src, window.location.origin);
    
    if (quality !== 85) url.searchParams.set('q', quality.toString());
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (format !== 'webp') url.searchParams.set('f', format);
    
    return url.pathname + url.search;
  }

  return src;
};

// Lazy loading con Intersection Observer
export const createLazyLoader = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );
};

// Precargar imágenes críticas
export const preloadImage = (src: string, options: ImageOptimizationOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = reject;
    
    // Configurar srcset si se proporcionan múltiples tamaños
    if (options.width) {
      const widths = [options.width, options.width * 2];
      img.srcset = generateSrcSet(src, widths);
    }
    
    img.src = optimizeImageUrl(src, options);
  });
};

// Convertir imagen a formato moderno
export const convertToModernFormat = async (
  file: File,
  format: 'webp' | 'avif' = 'webp',
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          `image/${format}`,
          quality
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Redimensionar imagen manteniendo aspect ratio
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          'image/webp',
          quality
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Comprimir imagen
export const compressImage = async (
  file: File,
  maxSizeKB: number = 500,
  format: 'webp' | 'avif' = 'webp'
): Promise<Blob> => {
  let quality = 0.8;
  let compressed: Blob;

  do {
    compressed = await convertToModernFormat(file, format, quality);
    quality -= 0.1;
  } while (compressed.size > maxSizeKB * 1024 && quality > 0.1);

  return compressed;
};

export default {
  supportsWebP,
  supportsAVIF,
  generateSrcSet,
  optimizeImageUrl,
  createLazyLoader,
  preloadImage,
  convertToModernFormat,
  resizeImage,
  compressImage
};
