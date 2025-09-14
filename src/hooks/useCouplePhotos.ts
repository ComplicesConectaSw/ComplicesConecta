// Hook para gestión de fotos de pareja con Supabase
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

      const { data, error: fetchError } = await supabase
        .from('couple_photos')
        .select('*')
        .eq('profile_id', currentProfileId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const photosWithUrls = data?.map(photo => ({
        id: photo.id,
        url: photo.photo_url,
        partner: (photo.partner_type === 'el' || photo.partner_type === 'ella') ? photo.partner_type : 'el' as 'el' | 'ella',
        isMain: photo.is_main || false,
        profileId: photo.profile_id,
        uploadedAt: new Date(photo.created_at)
      })) || [];

      setPhotos(photosWithUrls);
    } catch (err) {
      logger.error('Error loading couple photos:', err);
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

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentProfileId}/${partner}/${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Verificar si es la primera foto de este partner (será principal por defecto)
      const existingPhotos = photos.filter(p => p.partner === partner);
      const isFirstPhoto = existingPhotos.length === 0;

      // Si es la primera foto, hacer que las otras no sean principales
      if (isFirstPhoto) {
        await supabase
          .from('couple_photos')
          .update({ is_main: false })
          .eq('profile_id', currentProfileId)
          .eq('partner_type', partner);
      }

      // Guardar información en la base de datos
      const { data: photoData, error: dbError } = await supabase
        .from('couple_photos')
        .insert({
          profile_id: currentProfileId,
          photo_url: publicUrl,
          partner_type: partner,
          is_main: isFirstPhoto,
          storage_path: fileName
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Actualizar estado local
      const newPhoto: CouplePhoto = {
        id: photoData.id,
        url: publicUrl,
        partner,
        isMain: isFirstPhoto,
        uploadedAt: new Date(photoData.created_at),
        profileId: currentProfileId
      };

      setPhotos(prev => [newPhoto, ...prev]);

    } catch (err) {
      logger.error('Error uploading photo:', err);
      throw new Error('Error al subir la foto');
    }
  };

  // Eliminar foto
  const deletePhoto = async (photoId: string) => {
    try {
      setError(null);

      // Obtener información de la foto
      const { data: photoData, error: fetchError } = await supabase
        .from('couple_photos')
        .select('storage_path, partner_type, is_main')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;

      // Eliminar archivo del storage
      if (photoData.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('profile-images')
          .remove([photoData.storage_path]);

        if (storageError) {
          logger.warn('Error deleting file from storage:', storageError);
        }
      }

      // Eliminar registro de la base de datos
      const { error: deleteError } = await supabase
        .from('couple_photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) throw deleteError;

      // Si era la foto principal, hacer principal a la siguiente
      if (photoData.is_main) {
        const remainingPhotos = photos.filter(p => 
          p.id !== photoId && p.partner === photoData.partner_type
        );
        
        if (remainingPhotos.length > 0) {
          await setMainPhoto(remainingPhotos[0].id, photoData.partner_type as 'el' | 'ella');
        }
      }

      // Actualizar estado local
      setPhotos(prev => prev.filter(p => p.id !== photoId));

    } catch (err) {
      logger.error('Error deleting photo:', err);
      throw new Error('Error al eliminar la foto');
    }
  };

  // Establecer foto principal
  const setMainPhoto = async (photoId: string, partner: 'el' | 'ella') => {
    try {
      setError(null);

      // Quitar principal de todas las fotos de este partner
      await supabase
        .from('couple_photos')
        .update({ is_main: false })
        .eq('profile_id', currentProfileId!)
        .eq('partner_type', partner);

      // Establecer la nueva foto principal
      const { error: updateError } = await supabase
        .from('couple_photos')
        .update({ is_main: true })
        .eq('id', photoId);

      if (updateError) throw updateError;

      // Actualizar estado local
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        isMain: photo.partner === partner ? photo.id === photoId : photo.isMain
      })));

    } catch (err) {
      logger.error('Error setting main photo:', err);
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
