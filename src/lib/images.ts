/**
 * SERVICIO DE IMÁGENES - ComplicesConecta
 * 
 * Sistema completo de gestión de imágenes con soporte para:
 * - Imágenes públicas y privadas
 * - Permisos granulares de acceso
 * - Buckets de Storage organizados
 * - Validación y redimensionamiento
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ImageRow = Database['public']['Tables']['images']['Row'];
type ImageInsert = Database['public']['Tables']['images']['Insert'];
type ImagePermissionRow = Database['public']['Tables']['image_permissions']['Row'];

export interface ImageUploadResult {
  success: boolean;
  imageId?: string;
  url?: string;
  error?: string;
}

export interface ImagePermission {
  id: string;
  imageId: string;
  grantedBy: string;
  grantedTo: string;
  createdAt: string;
}

export interface UserImage {
  id: string;
  url: string;
  description?: string;
  isPublic: boolean;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sube una imagen al bucket correspondiente
 */
export async function uploadImage(
  file: File,
  profileId: string,
  isPublic: boolean = false,
  description?: string
): Promise<ImageUploadResult> {
  try {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Determinar bucket según tipo
    const bucket = isPublic ? 'gallery-images' : 'profile-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}/${Date.now()}.${fileExt}`;

    // Subir archivo a Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { success: false, error: `Error al subir archivo: ${uploadError.message}` };
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    // Guardar metadata en BD
    const imageData: ImageInsert = {
      profile_id: profileId,
      url: urlData.publicUrl,
      description: description || null,
      is_public: isPublic
    };

    const { data: dbData, error: dbError } = await supabase
      .from('images')
      .insert(imageData)
      .select()
      .single();

    if (dbError) {
      // Limpiar archivo subido si falla la BD
      await supabase.storage.from(bucket).remove([uploadData.path]);
      return { success: false, error: `Error en base de datos: ${dbError.message}` };
    }

    return {
      success: true,
      imageId: dbData.id,
      url: dbData.url
    };

  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Obtiene las imágenes de un usuario específico
 */
export async function getUserImages(profileId: string): Promise<UserImage[]> {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener imágenes del usuario:', error);
      return [];
    }

    return data.map(mapImageRowToUserImage);
  } catch (error) {
    console.error('Error inesperado al obtener imágenes:', error);
    return [];
  }
}

/**
 * Obtiene imágenes públicas para el feed
 */
export async function getPublicImages(limit: number = 20): Promise<UserImage[]> {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error al obtener imágenes públicas:', error);
      return [];
    }

    return data.map(mapImageRowToUserImage);
  } catch (error) {
    console.error('Error inesperado al obtener imágenes públicas:', error);
    return [];
  }
}

/**
 * Elimina una imagen (archivo y metadata)
 */
export async function deleteImage(imageId: string, profileId: string): Promise<boolean> {
  try {
    // Obtener datos de la imagen
    const { data: imageData, error: fetchError } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('profile_id', profileId)
      .single();

    if (fetchError || !imageData) {
      console.error('Imagen no encontrada o sin permisos');
      return false;
    }

    // Extraer path del archivo desde URL
    const url = new URL(imageData.url);
    const pathParts = url.pathname.split('/');
    const bucket = pathParts[pathParts.length - 3]; // bucket name
    const filePath = pathParts.slice(-2).join('/'); // profileId/filename

    // Eliminar archivo de Storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (storageError) {
      console.error('Error al eliminar archivo:', storageError);
    }

    // Eliminar metadata de BD
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)
      .eq('profile_id', profileId);

    if (dbError) {
      console.error('Error al eliminar metadata:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inesperado al eliminar imagen:', error);
    return false;
  }
}

/**
 * Otorga permiso de acceso a una imagen privada
 */
export async function grantImagePermission(
  imageId: string,
  grantedBy: string,
  grantedTo: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('image_permissions')
      .insert({
        image_id: imageId,
        granted_by: grantedBy,
        granted_to: grantedTo
      });

    if (error) {
      console.error('Error al otorgar permiso:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inesperado al otorgar permiso:', error);
    return false;
  }
}

/**
 * Revoca permiso de acceso a una imagen
 */
export async function revokeImagePermission(
  imageId: string,
  grantedBy: string,
  grantedTo: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('image_permissions')
      .delete()
      .eq('image_id', imageId)
      .eq('granted_by', grantedBy)
      .eq('granted_to', grantedTo);

    if (error) {
      console.error('Error al revocar permiso:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inesperado al revocar permiso:', error);
    return false;
  }
}

/**
 * Verifica si un usuario tiene permiso para ver una imagen
 */
export async function hasImagePermission(
  imageId: string,
  profileId: string
): Promise<boolean> {
  try {
    // Verificar si la imagen es pública
    const { data: imageData, error: imageError } = await supabase
      .from('images')
      .select('is_public, profile_id')
      .eq('id', imageId)
      .single();

    if (imageError || !imageData) {
      return false;
    }

    // Si es pública o es el propietario, tiene acceso
    if (imageData.is_public || imageData.profile_id === profileId) {
      return true;
    }

    // Verificar permisos explícitos
    const { data: permissionData, error: permissionError } = await supabase
      .from('image_permissions')
      .select('id')
      .eq('image_id', imageId)
      .eq('granted_to', profileId)
      .single();

    return !permissionError && !!permissionData;
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
}

/**
 * Obtiene todos los permisos de una imagen
 */
export async function getImagePermissions(imageId: string): Promise<ImagePermission[]> {
  try {
    const { data, error } = await supabase
      .from('image_permissions')
      .select('*')
      .eq('image_id', imageId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener permisos:', error);
      return [];
    }

    return data.map(mapPermissionRowToImagePermission);
  } catch (error) {
    console.error('Error inesperado al obtener permisos:', error);
    return [];
  }
}

/**
 * Valida un archivo de imagen
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se permiten JPEG, PNG y WebP.'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 10MB permitido.'
    };
  }
  
  return { valid: true };
}

// Funciones de mapeo
function mapImageRowToUserImage(row: ImageRow): UserImage {
  return {
    id: row.id,
    url: row.url,
    description: row.description || undefined,
    isPublic: row.is_public || false,
    profileId: row.profile_id,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function mapPermissionRowToImagePermission(row: ImagePermissionRow): ImagePermission {
  return {
    id: row.id,
    imageId: row.image_id,
    grantedBy: row.granted_by,
    grantedTo: row.granted_to,
    createdAt: row.created_at || ''
  };
}
