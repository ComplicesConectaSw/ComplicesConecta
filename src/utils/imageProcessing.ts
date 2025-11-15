import { logger } from '@/lib/logger';
// Utility functions for image processing and uploading

export interface ImageUploadResult {
  file: File;
  preview: string;
  processed?: Blob;
}

export const processImageUpload = async (file: File): Promise<ImageUploadResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const imageUrl = event.target?.result as string;
        
        // Create image element for processing
        const img = new Image();
        img.onload = async () => {
          try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas') as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) throw new Error('Could not get canvas context');
            
            // Calculate new dimensions (max 1200px while maintaining aspect ratio)
            const maxSize = 1200;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
              }
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with compression
            canvas.toBlob(
              (blob: Blob | null) => {
                if (blob) {
                  resolve({
                    file,
                    preview: imageUrl,
                    processed: blob
                  });
                } else {
                  reject(new Error('Failed to process image'));
                }
              },
              'image/jpeg',
              0.8 // 80% quality
            );
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP.'
    };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 10MB.'
    };
  }
  
  return { valid: true };
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    
    reader.onerror = () => reject(new Error('Failed to create preview'));
    reader.readAsDataURL(file);
  });
};

// Background removal utility (requires @huggingface/transformers)
export const removeImageBackground = async (_imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    logger.info('Starting background removal process...');
    
    // Feature not available - dependency removed
    throw new Error('Background removal feature is not available. Please ensure @huggingface/transformers is properly installed.');
  } catch (error) {
    logger.error('Error removing background:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Optimizar imagen para diferentes tamaños y calidades
 */
export const optimizeImageForSize = async (
  file: File, 
  targetSize: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): Promise<Blob> => {
  const configs = {
    thumbnail: { maxSize: 150, quality: 0.7 },
    medium: { maxSize: 400, quality: 0.8 },
    large: { maxSize: 800, quality: 0.9 },
    original: { maxSize: 1200, quality: 0.95 }
  };

  const config = configs[targetSize];
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        if (width > height) {
          if (width > config.maxSize) {
            height = Math.round((height * config.maxSize) / width);
            width = config.maxSize;
          }
        } else {
          if (height > config.maxSize) {
            width = Math.round((width * config.maxSize) / height);
            height = config.maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create optimized image'));
            }
          },
          'image/jpeg',
          config.quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generar múltiples tamaños de una imagen
 */
export const generateImageVariants = async (file: File): Promise<{
  thumbnail: Blob;
  medium: Blob;
  large: Blob;
  original: Blob;
}> => {
  try {
    const [thumbnail, medium, large, original] = await Promise.all([
      optimizeImageForSize(file, 'thumbnail'),
      optimizeImageForSize(file, 'medium'),
      optimizeImageForSize(file, 'large'),
      optimizeImageForSize(file, 'original')
    ]);

    return { thumbnail, medium, large, original };
  } catch (error) {
    logger.error('Error generating image variants:', { error });
    throw error;
  }
};

/**
 * Detectar si una imagen es apropiada usando análisis básico
 */
export const analyzeImageContent = async (file: File): Promise<{
  isAppropriate: boolean;
  confidence: number;
  detectedFeatures: string[];
  warnings: string[];
}> => {
  try {
    const img = await loadImageFromFile(file);
    
    // Análisis básico de contenido
    const detectedFeatures: string[] = [];
    const warnings: string[] = [];
    
    // Verificar dimensiones
    if (img.width < 100 || img.height < 100) {
      warnings.push('Imagen muy pequeña');
    }
    
    if (img.width > 4000 || img.height > 4000) {
      warnings.push('Imagen muy grande');
    }
    
    // Verificar aspect ratio
    const aspectRatio = img.width / img.height;
    if (aspectRatio < 0.5 || aspectRatio > 2) {
      warnings.push('Proporción inusual');
    }
    
    // Análisis de colores básico
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = Math.min(img.width, 100);
      canvas.height = Math.min(img.height, 100);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let totalBrightness = 0;
      let totalSaturation = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calcular brillo
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        
        // Calcular saturación básica
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        totalSaturation += saturation;
      }
      
      const avgBrightness = totalBrightness / (data.length / 4);
      const avgSaturation = totalSaturation / (data.length / 4);
      
      if (avgBrightness < 50) {
        warnings.push('Imagen muy oscura');
      } else if (avgBrightness > 200) {
        warnings.push('Imagen muy brillante');
      }
      
      if (avgSaturation < 0.1) {
        detectedFeatures.push('imagen en escala de grises');
      } else if (avgSaturation > 0.8) {
        detectedFeatures.push('colores muy saturados');
      }
    }
    
    // Determinar si es apropiada
    const isAppropriate = warnings.length === 0;
    const confidence = Math.max(0.5, 1 - (warnings.length * 0.2));
    
    return {
      isAppropriate,
      confidence,
      detectedFeatures,
      warnings
    };
  } catch (error) {
    logger.error('Error analyzing image content:', { error });
    return {
      isAppropriate: false,
      confidence: 0,
      detectedFeatures: [],
      warnings: ['Error analizando imagen']
    };
  }
};

/**
 * Comprimir imagen manteniendo calidad visual
 */
export const compressImage = async (
  file: File, 
  maxSizeKB: number = 500
): Promise<Blob> => {
  let quality = 0.9;
  let blob: Blob;
  
  do {
    blob = await optimizeImageForSize(file, 'large');
    quality -= 0.1;
    
    if (quality <= 0.1) break;
  } while (blob.size > maxSizeKB * 1024 && quality > 0.1);
  
  return blob;
};

/**
 * Crear imagen con marca de agua
 */
export const addWatermark = async (
  file: File, 
  watermarkText: string = 'ComplicesConecta'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar imagen original
        ctx.drawImage(img, 0, 0);
        
        // Agregar marca de agua
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(watermarkText, canvas.width - 10, canvas.height - 10);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create watermarked image'));
            }
          },
          'image/jpeg',
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};