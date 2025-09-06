// SERVICIO TEMPORAL DE IMÁGENES
// Este archivo será reemplazado cuando se ejecuten las migraciones de BD

export interface ImageRecord {
  id: string;
  profile_id: string;
  url: string;
  is_public: boolean;
  type: 'profile' | 'gallery' | 'cover';
  title?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImagePermission {
  id: string;
  image_id: string;
  requester_profile_id: string;
  granted_by_profile_id: string;
  granted: boolean;
  created_at: string;
}

export interface GalleryAccessRequest {
  id: string;
  requester_profile_id: string;
  target_profile_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  decided_at?: string;
}

class ImagesService {
  /**
   * VERSIÓN TEMPORAL - Retorna error hasta que se ejecuten migraciones
   */
  async uploadImage(
    file: File,
    profileId: string,
    isPublic: boolean = true,
    type: 'profile' | 'gallery' | 'cover' = 'gallery',
    title?: string,
    description?: string
  ): Promise<{ success: boolean; imageId?: string; url?: string; error?: string }> {
    return {
      success: false,
      error: 'Sistema de imágenes no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async getProfileImages(
    targetProfileId: string,
    viewerProfileId?: string
  ): Promise<{ success: boolean; images?: ImageRecord[]; error?: string }> {
    return {
      success: false,
      error: 'Sistema de imágenes no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async hasImagePermission(imageId: string, viewerProfileId: string): Promise<boolean> {
    return false;
  }

  async requestGalleryAccess(
    targetProfileId: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Sistema de imágenes no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async respondToGalleryRequest(
    requestId: string,
    accept: boolean
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Sistema de imágenes no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async getPendingGalleryRequests(): Promise<{
    success: boolean;
    requests?: GalleryAccessRequest[];
    error?: string;
  }> {
    return {
      success: false,
      error: 'Sistema de imágenes no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }

  async deleteImage(imageId: string): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Sistema de imágenes no disponible. Ejecute primero las migraciones de base de datos (dev-scripts/migrations.sql)'
    };
  }
}

export const imagesService = new ImagesService();
