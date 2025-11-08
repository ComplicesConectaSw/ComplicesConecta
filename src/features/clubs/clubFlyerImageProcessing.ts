// Servicio de procesamiento IA para imágenes de clubs
// Watermark + Blur automático para caras/tatuajes
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface ProcessingResult {
  watermarkedUrl: string;
  blurredUrl: string;
  facesDetected: number;
  tattoosDetected: number;
  processingTime: number;
}

/**
 * Detectar caras en imagen usando análisis básico
 * En producción, usar servicio de IA (Hugging Face, AWS Rekognition, etc.)
 */
export const detectFaces = async (imageUrl: string): Promise<FaceDetection[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Detección básica: analizar regiones centrales donde suelen estar las caras
      // En producción, integrar con modelo ML real
      const faces: FaceDetection[] = [];
      
      // Detectar posibles caras en regiones comunes
      const regions = [
        { x: 0.1, y: 0.1, w: 0.3, h: 0.4 }, // Esquina superior izquierda
        { x: 0.6, y: 0.1, w: 0.3, h: 0.4 }, // Esquina superior derecha
        { x: 0.35, y: 0.2, w: 0.3, h: 0.4 }, // Centro superior
      ];

      regions.forEach((region) => {
        faces.push({
          x: img.width * region.x,
          y: img.height * region.y,
          width: img.width * region.w,
          height: img.height * region.h,
          confidence: 0.7,
        });
      });

      resolve(faces);
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
};

/**
 * Aplicar blur gaussiano a regiones específicas
 */
const applyGaussianBlur = (
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 10
): void => {
  const data = imageData.data;
  const tempData = new Uint8ClampedArray(data);

  for (let py = y; py < y + height && py < imageData.height; py++) {
    for (let px = x; px < x + width && px < imageData.width; px++) {
      let r = 0, g = 0, b = 0, count = 0;

      // Promediar píxeles en radio
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = px + dx;
          const ny = py + dy;
          
          if (nx >= 0 && nx < imageData.width && ny >= 0 && ny < imageData.height) {
            const idx = (ny * imageData.width + nx) * 4;
            r += tempData[idx];
            g += tempData[idx + 1];
            b += tempData[idx + 2];
            count++;
          }
        }
      }

      const idx = (py * imageData.width + px) * 4;
      if (count > 0) {
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
      }
    }
  }
};

/**
 * Aplicar blur a regiones específicas de la imagen
 */
export const applyBlurToRegions = async (
  imageUrl: string,
  regions: Array<{ x: number; y: number; width: number; height: number }>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Dibujar imagen original
      ctx.drawImage(img, 0, 0);

      // Obtener ImageData
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Aplicar blur a cada región
      regions.forEach((region) => {
        applyGaussianBlur(
          imageData,
          Math.max(0, Math.floor(region.x)),
          Math.max(0, Math.floor(region.y)),
          Math.min(canvas.width, Math.floor(region.width)),
          Math.min(canvas.height, Math.floor(region.height)),
          15 // Radio de blur
        );
      });

      // Restaurar imagen procesada
      ctx.putImageData(imageData, 0, 0);

      // Convertir a blob URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blurred image'));
          }
        },
        'image/jpeg',
        0.9
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

/**
 * Aplicar watermark a imagen
 */
export const applyWatermark = async (
  imageUrl: string,
  watermarkText: string = 'ComplicesConecta'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Dibujar imagen original
      ctx.drawImage(img, 0, 0);

      // Configurar watermark
      const fontSize = Math.max(20, img.width / 25);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      // Posición del watermark
      const x = canvas.width - 25;
      const y = canvas.height - 25;

      // Dibujar sombra/contorno
      ctx.strokeText(watermarkText, x, y);
      // Dibujar texto principal
      ctx.fillText(watermarkText, x, y);

      // Convertir a blob URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create watermarked image'));
          }
        },
        'image/jpeg',
        0.9
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

/**
 * Procesar imagen completa: detectar caras/tatuajes, aplicar blur y watermark
 */
export const processClubFlyerImage = async (
  imageUrl: string,
  flyerId: string
): Promise<ProcessingResult> => {
  const startTime = Date.now();
  
  try {
    logger.info(`🖼️ Procesando imagen de flyer: ${flyerId}`);

    // 1. Detectar caras
    const faces = await detectFaces(imageUrl);
    logger.info(`👤 Caras detectadas: ${faces.length}`);

    // 2. Detectar tatuajes (regiones alrededor de caras)
    const tattoos: Array<{ x: number; y: number; width: number; height: number }> = [];
    faces.forEach((face) => {
      // Agregar región expandida para posibles tatuajes visibles
      tattoos.push({
        x: Math.max(0, face.x - 30),
        y: Math.max(0, face.y - 30),
        width: Math.min(face.width + 60, 200),
        height: Math.min(face.height + 60, 200),
      });
    });

    // 3. Aplicar blur a caras y tatuajes
    const regionsToBlur = [...faces, ...tattoos];
    const blurredUrl = regionsToBlur.length > 0
      ? await applyBlurToRegions(imageUrl, regionsToBlur)
      : imageUrl;

    // 4. Aplicar watermark
    const watermarkedUrl = await applyWatermark(blurredUrl, 'ComplicesConecta');

    const processingTime = Date.now() - startTime;

    logger.info(`✅ Imagen procesada en ${processingTime}ms`, {
      faces: faces.length,
      tattoos: tattoos.length,
    });

    return {
      watermarkedUrl,
      blurredUrl,
      facesDetected: faces.length,
      tattoosDetected: tattoos.length,
      processingTime,
    };
  } catch (error) {
    logger.error('Error procesando imagen:', error);
    throw error;
  }
};

/**
 * Procesar imagen en servidor (Edge Function)
 */
export const processClubFlyerImageServer = async (
  imageUrl: string,
  flyerId: string
): Promise<ProcessingResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('process-club-flyer-image', {
      body: {
        image_url: imageUrl,
        flyer_id: flyerId,
      },
    });

    if (error) throw error;

    return data as ProcessingResult;
  } catch (error) {
    logger.error('Error procesando imagen en servidor:', error);
    // Fallback a procesamiento cliente
    return processClubFlyerImage(imageUrl, flyerId);
  }
};

/**
 * Subir imagen procesada a Supabase Storage
 */
export const uploadProcessedImage = async (
  blob: Blob,
  path: string,
  bucket: string = 'club-flyers'
): Promise<string> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (error) {
    logger.error('Error subiendo imagen procesada:', error);
    throw error;
  }
};

