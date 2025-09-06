import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageUploadOptions {
  bucket: string;
  folder: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: Partial<ImageUploadOptions> = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

/**
 * Sube una imagen a Supabase Storage
 */
export async function uploadImage(
  file: File,
  options: ImageUploadOptions
): Promise<ImageUploadResult> {
  try {
    // Validar tipo de archivo
    const allowedTypes = options.allowedTypes || DEFAULT_OPTIONS.allowedTypes!;
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`
      };
    }

    // Validar tamaño
    const maxSize = options.maxSizeBytes || DEFAULT_OPTIONS.maxSizeBytes!;
    if (file.size > maxSize) {
      return {
        success: false,
        error: `El archivo es muy grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${options.folder}/${fileName}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return {
        success: false,
        error: `Error al subir imagen: ${error.message}`
      };
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Elimina una imagen de Supabase Storage
 */
export async function deleteImage(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: `Error al eliminar imagen: ${error.message}`
      };
    }

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Redimensiona una imagen usando Canvas API
 */
export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
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

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a blob y luego a File
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Error al redimensionar imagen'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Funciones específicas para perfiles
 */
export const ProfileImageService = {
  /**
   * Sube imagen de perfil principal
   */
  async uploadProfileImage(file: File, userId: string): Promise<ImageUploadResult> {
    // Redimensionar imagen antes de subir
    const resizedFile = await resizeImage(file, 800, 800, 0.85);
    
    return uploadImage(resizedFile, {
      bucket: 'profile-images',
      folder: `profiles/${userId}`,
      maxSizeBytes: 3 * 1024 * 1024 // 3MB para perfiles
    });
  },

  /**
   * Sube imagen para galería privada
   */
  async uploadGalleryImage(file: File, userId: string): Promise<ImageUploadResult> {
    // Redimensionar para galería
    const resizedFile = await resizeImage(file, 1200, 1200, 0.9);
    
    return uploadImage(resizedFile, {
      bucket: 'gallery-images',
      folder: `galleries/${userId}`,
      maxSizeBytes: 5 * 1024 * 1024 // 5MB para galería
    });
  },

  /**
   * Elimina imagen de perfil
   */
  async deleteProfileImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extraer path de la URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucket = pathParts[pathParts.length - 3]; // profile-images o gallery-images
      const folder = pathParts[pathParts.length - 2]; // profiles/userId o galleries/userId
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${folder}/${fileName}`;

      return deleteImage(bucket, filePath);
    } catch (error) {
      return {
        success: false,
        error: 'URL de imagen inválida'
      };
    }
  }
};
