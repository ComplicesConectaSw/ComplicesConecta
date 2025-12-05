// @ts-nocheck
// Hook para gestión de fotos de pareja con Supabase
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface CouplePhoto {
  id: string;
  url: string;
  partner: 'el' | 'ella';
  isMain: boolean;
  uploadedAt: Date;
  profileId: string;
}

interface UseCouplePhotosReturn {
  photos: CouplePhoto[];
  loading: boolean;
  error: string | null;
  uploadPhoto: (file: File, partner: 'el' | 'ella') => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  setMainPhoto: (photoId: string, partner: 'el' | 'ella') => Promise<void>;
  refreshPhotos: () => Promise<void>;
}

export const useCouplePhotos = (profileId?: string): UseCouplePhotosReturn => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<CouplePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentProfileId = profileId || user?.id;

  // Cargar fotos del perfil
  const loadPhotos = async () => {
    if (!currentProfileId) return;

    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        logger.error('Supabase no está disponible');
        setError('Supabase no está disponible');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('couple_profiles')
        .select('couple_images, id, created_at')
        .eq('id', currentProfileId!)
        .single() as any;

      if (fetchError) throw fetchError;

      const photosWithUrls = (data as any)?.couple_images?.map((url: any, index: any) => ({
        id: `${(data as any).id}-${index}`,
        url: url,
        partner: (index % 2 === 0 ? 'el' : 'ella') as 'el' | 'ella',
        isMain: index === 0,
        profileId: (data as any).id,
        uploadedAt: new Date((data as any).created_at || new Date())
      })) || [];

      setPhotos(photosWithUrls);
    } catch (err) {
      logger.error('Error loading couple photos:', { error: err instanceof Error ? err.message : String(err) });
      setError('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  // Subir nueva foto
  const uploadPhoto = async (file: File, partner: 'el' | 'ella') => {
    if (!currentProfileId) throw new Error('No hay usuario autenticado');

    try {
      setError(null);

      if (!supabase || !supabase.storage) {
        logger.error('Supabase Storage no está disponible');
        throw new Error('Supabase Storage no está disponible');
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentProfileId}/${partner}/${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      if (!supabase || !supabase.storage) {
        throw new Error('Supabase Storage no está disponible');
      }
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      
      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }

      // Verificar si es la primera foto de este partner (será principal por defecto)
      const existingPhotos = photos.filter(p => p.partner === partner);
      const isFirstPhoto = existingPhotos.length === 0;

      // Obtener las imágenes actuales del perfil
      const { data: currentProfile, error: profileError } = await supabase
        .from('couple_profiles')
        .select('couple_images')
        .eq('id', currentProfileId!)
        .single() as any;

      if (profileError) throw profileError;

      // Agregar la nueva imagen al array
      const updatedImages = [...((currentProfile as any)?.couple_images || []), publicUrl];

      // Actualizar el perfil con las nuevas imágenes
      const { error: insertError } = await supabase
        .from('couple_profiles')
        .update({ couple_images: updatedImages } as any)
        .eq('id', currentProfileId!);

      if (insertError) throw insertError;

      // Actualizar estado local
      const newPhotoData: CouplePhoto = {
        id: `${currentProfileId}-${updatedImages.length - 1}`,
        url: publicUrl,
        partner,
        isMain: isFirstPhoto,
        uploadedAt: new Date(),
        profileId: currentProfileId
      };

      setPhotos(prev => [newPhotoData, ...prev]);

    } catch (err) {
      logger.error('Error uploading photo:', { error: err instanceof Error ? err.message : String(err) });
      throw new Error('Error al subir la foto');
    }
  };

  // Eliminar foto
  const deletePhoto = async (photoId: string) => {
    try {
      setError(null);

      // Obtener información de la foto
      const photoToDelete = photos.find(p => p.id === photoId);
      if (!photoToDelete) throw new Error('Foto no encontrada');

      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }

      // Obtener las imágenes actuales del perfil
      const { data: currentProfile, error: fetchError } = await supabase
        .from('couple_profiles')
        .select('couple_images')
        .eq('id', currentProfileId!)
        .single() as any;

      if (fetchError) throw fetchError;

      // Obtener la URL de la imagen a eliminar
      const photoToDeleteUrl = photoToDelete.url;
      
      // Eliminar archivo de storage (extraer path de la URL)
      if (supabase.storage) {
        const urlParts = photoToDeleteUrl.split('/');
        const storagePath = urlParts.slice(-3).join('/');
        const { error: storageError } = await supabase.storage
          .from('profile-images')
          .remove([storagePath]);

        if (storageError) {
          logger.warn('Error deleting from storage:', storageError);
        }
      }

      // Eliminar de la base de datos (remover de array)
      const updatedImages = (currentProfile as any)?.couple_images?.filter((url: any) => url !== photoToDeleteUrl) || [];
      const { error: dbError } = await supabase
        .from('couple_profiles')
        .update({ couple_images: updatedImages } as any)
        .eq('id', currentProfileId!);

      if (dbError) throw dbError;

      // La lógica de foto principal se maneja automáticamente con el orden del array

      // Actualizar estado local
      setPhotos(prev => prev.filter(p => p.id !== photoId));

    } catch (err) {
      logger.error('Error deleting photo:', { error: err instanceof Error ? err.message : String(err) });
      throw new Error('Error al eliminar la foto');
    }
  };

  // Establecer foto principal
  const setMainPhoto = async (photoId: string, partner: 'el' | 'ella') => {
    try {
      setError(null);

      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }

      // Obtener las imágenes actuales
      const { data: currentProfile, error: profileError } = await supabase
        .from('couple_profiles')
        .select('couple_images')
        .eq('id', currentProfileId!)
        .single() as any;

      if (profileError) throw profileError;

      // Reordenar array para poner la imagen seleccionada al principio
      const photoToMove = photos.find(p => p.id === photoId);
      if (!photoToMove) throw new Error('Foto no encontrada');
      
      const updatedImages = (currentProfile as any)?.couple_images?.filter((url: any) => url !== photoToMove.url) || [];
      updatedImages.unshift(photoToMove.url);

      // Actualizar el perfil
      const { error: updateError } = await supabase
        .from('couple_profiles')
        .update({ couple_images: updatedImages } as any)
        .eq('id', currentProfileId!);

      if (updateError) throw updateError;

      // Actualizar estado local
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        isMain: photo.partner === partner ? photo.id === photoId : photo.isMain
      })));

    } catch (err) {
      logger.error('Error setting main photo:', { error: err instanceof Error ? err.message : String(err) });
      throw new Error('Error al establecer foto principal');
    }
  };

  // Refrescar fotos
  const refreshPhotos = async () => {
    await loadPhotos();
  };

  // Cargar fotos al montar el componente
  useEffect(() => {
    if (currentProfileId) {
      loadPhotos();
    }
  }, [currentProfileId]);

  return {
    photos,
    loading,
    error,
    uploadPhoto,
    deletePhoto,
    setMainPhoto,
    refreshPhotos
  };
};
