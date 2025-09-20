// Hook para gestión de fotos de pareja con Supabase
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

// Tipos basados en el schema de Supabase
type CouplePhotoRow = Database['public']['Tables']['couple_photos']['Row'];
type CouplePhotoInsert = Database['public']['Tables']['couple_photos']['Insert'];

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

      const photosWithUrls = data?.map((photo: CouplePhotoRow) => ({
        id: photo.id,
        url: photo.image_url || '',
        partner: (photo.title === 'el' || photo.title === 'ella') ? photo.title as 'el' | 'ella' : 'el' as 'el' | 'ella',
        isMain: photo.is_public || false,
        profileId: photo.couple_id || '',
        uploadedAt: new Date(photo.created_at)
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
          .update({ is_public: false })
          .eq('couple_id', currentProfileId)
          .neq('id', 'temp');
      }

      // Guardar información en la base de datos
      const photoInsert: CouplePhotoInsert = {
        couple_id: currentProfileId,
        photo_url: publicUrl,
        partner_type: partner,
        is_main: isFirstPhoto,
        storage_path: fileName
      };

      const { data: newPhoto, error: insertError } = await supabase
        .from('couple_photos')
        .insert(photoInsert)
        .select()
        .single();

      if (insertError) throw insertError;

      // Actualizar estado local
      const photoRow = newPhoto as CouplePhotoRow;
      const newPhotoData: CouplePhoto = {
        id: photoRow.id,
        url: publicUrl,
        partner,
        isMain: isFirstPhoto,
        uploadedAt: new Date(photoRow.created_at),
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

      // Obtener información de la foto desde la base de datos
      const { data: photoData, error: fetchError } = await supabase
        .from('couple_photos')
        .select('storage_path, is_main, partner_type')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;

      // Eliminar archivo de storage
      const storageData = photoData as { storage_path: string; is_main: boolean; partner_type: string };
      const { error: storageError } = await supabase.storage
        .from('couple-photos')
        .remove([storageData.storage_path]);

      if (storageError) {
        logger.warn('Error deleting from storage:', { error: storageError.message });
      }

      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from('couple_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Si era la foto principal y hay más fotos del mismo partner, hacer principal la siguiente
      if (storageData.is_main) {
        const remainingPhotos = photos.filter(p => 
          p.id !== photoId && p.partner === storageData.partner_type
        );
        
        if (remainingPhotos.length > 0) {
          await supabase
            .from('couple_photos')
            .update({ is_main: true })
            .eq('id', remainingPhotos[0].id);
        }
      }

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

      // Quitar principal de todas las fotos
      const { error: updateError } = await supabase
        .from('couple_photos')
        .update({ is_main: false })
        .eq('couple_id', currentProfileId)
        .eq('title', partner);

      if (updateError) throw updateError;

      // Establecer la nueva foto principal
      const { error: updateError2 } = await supabase
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
