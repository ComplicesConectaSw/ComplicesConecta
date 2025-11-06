/**
 * Sistema de Imágenes - ComplicesConecta v2.0.0
 * Sistema completo de gestión de imágenes con Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';
import { logger, logDatabaseOperation } from '@/lib/logger';

// Interfaces para el sistema de imágenes
export interface ImageUpload {
  id: string;
  profile_id: string;
  url: string;
  is_public: boolean;
  type?: 'profile' | 'gallery' | 'cover';
  title?: string;
  description?: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadResult {
  success: boolean;
  data?: ImageUpload;
  error?: string;
  url?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Configuración de buckets de Storage
const STORAGE_BUCKETS = {
  PROFILE: 'profile-images',
  GALLERY: 'gallery-images', 
  CHAT: 'chat-media'
} as const;

// Límites de archivos
const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

/**
 * Valida un archivo de imagen antes de subirlo
 */
export function validateImageFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' };
  }

  if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Use JPG, PNG, WebP o GIF' };
  }

  if (file.size > FILE_LIMITS.MAX_SIZE) {
    return { valid: false, error: `El archivo es demasiado grande. Máximo ${FILE_LIMITS.MAX_SIZE / 1024 / 1024}MB` };
  }

  return { valid: true };
}

/**
 * Sube una imagen a Supabase Storage y guarda los metadatos
 */
export async function uploadImage(
  file: File,
  profileId: string,
  isPublic: boolean = false,
  description?: string
): Promise<UploadResult> {
  try {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Verificar que Supabase esté disponible
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return { success: false, error: 'Supabase no está disponible' };
    }

    // Determinar bucket según privacidad
    const bucket = isPublic ? STORAGE_BUCKETS.GALLERY : STORAGE_BUCKETS.PROFILE;
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}/${Date.now()}.${fileExt}`;

    // Subir archivo a Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      logger.error('Error uploading file to storage', {
        error: uploadError.message,
        fileName,
        bucket,
        context: 'image-upload'
      });
      return { success: false, error: 'Error al subir la imagen' };
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Guardar metadatos en la base de datos
    const { data: dbData, error: dbError } = await (supabase as any)
      .from('images')
      .insert({
        profile_id: profileId,
        url: publicUrl,
        is_public: isPublic,
        title: file.name,
        description,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (dbError) {
      logDatabaseOperation('insert', 'images', false, {
        error: dbError.message,
        fileName,
        profileId,
        context: 'image-metadata-save'
      });
      // Limpiar archivo subido si falla la BD
      if (supabase && supabase.storage) {
        await supabase.storage.from(bucket).remove([fileName]);
      }
      return { success: false, error: 'Error al guardar información de la imagen' };
    }

    return { 
      success: true, 
      data: {
        ...dbData,
        is_public: isPublic
      } as ImageUpload,
      url: publicUrl
    };

  } catch (error) {
    logger.error('Unexpected error in uploadImage', {
      error: error instanceof Error ? error.message : String(error),
      profileId,
      fileName: file.name,
      context: 'image-upload-unexpected'
    });
    return { success: false, error: 'Error inesperado al subir la imagen' };
  }
}

/**
 * Obtiene las imágenes de un usuario
 */
export async function getUserImages(
  profileId: string,
  includePrivate: boolean = false
): Promise<ImageUpload[]> {
  try {
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return [];
    }

    let query = (supabase as any)
      .from('images')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (!includePrivate) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      logDatabaseOperation('select', 'images', false, {
        error: error.message,
        profileId,
        context: 'fetch-user-images'
      });
      return [];
    }

    // Mapear datos para asegurar compatibilidad con la interfaz
    return (data || []).map((item: any) => ({
      ...item,
      type: 'gallery' as 'gallery' // Default type since DB doesn't have type column yet
    })) as ImageUpload[];
  } catch (error) {
    logger.error('Unexpected error in getUserImages', {
      error: error instanceof Error ? error.message : String(error),
      profileId,
      context: 'get-user-images-unexpected'
    });
    return [];
  }
}

/**
 * Elimina una imagen del Storage y base de datos
 */
export async function deleteImage(imageId: string, profileId: string): Promise<boolean> {
  try {
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return false;
    }

    // Obtener información de la imagen
    const { data: image, error: fetchError } = await (supabase as any)
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('profile_id', profileId)
      .single();

    if (fetchError || !image) {
      logDatabaseOperation('select', 'images', false, {
        error: fetchError?.message || 'Image not found',
        imageId,
        profileId,
        context: 'fetch-image-for-delete'
      });
      return false;
    }

    // Determinar bucket y nombre del archivo
    const bucket = (image as any).is_public ? STORAGE_BUCKETS.GALLERY : STORAGE_BUCKETS.PROFILE;
    const fileName = (image as any).url.split('/').pop();

    // Eliminar archivo del Storage
    if (fileName) {
      if (supabase) {
        await supabase.storage.from(bucket).remove([`${profileId}/${fileName}`]);
      }
    }

    // Eliminar registro de la base de datos
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return false;
    }

    const { error: deleteError } = await (supabase as any)
      .from('images')
      .delete()
      .eq('id', imageId)
      .eq('profile_id', profileId);

    if (deleteError) {
      logDatabaseOperation('delete', 'images', false, {
        error: deleteError.message,
        imageId,
        profileId,
        context: 'delete-image-metadata'
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Unexpected error in deleteImage', {
      error: error instanceof Error ? error.message : String(error),
      imageId,
      profileId,
      context: 'delete-image-unexpected'
    });
    return false;
  }
}

/**
 * Obtiene imágenes públicas para la galería general
 */
export async function getPublicImages(limit: number = 20): Promise<ImageUpload[]> {
  try {
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return [];
    }

    const { data, error } = await (supabase as any)
      .from('images')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logDatabaseOperation('select', 'images', false, {
        error: error.message,
        limit,
        context: 'fetch-public-images'
      });
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      type: 'gallery' as 'gallery' // Default type since DB doesn't have type column yet
    })) as ImageUpload[];
  } catch (error) {
    logger.error('Unexpected error in getPublicImages', {
      error: error instanceof Error ? error.message : String(error),
      limit,
      context: 'get-public-images-unexpected'
    });
    return [];
  }
}