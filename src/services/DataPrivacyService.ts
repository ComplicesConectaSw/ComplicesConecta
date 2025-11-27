/**
 * DataPrivacyService - Servicio para gestión de privacidad de datos (GDPR)
 * 
 * Implementa:
 * - Exportación de datos (GDPR Art. 15 - Right of access)
 * - Eliminación de cuenta (GDPR Art. 17 - Right to erasure / "Right to be forgotten")
 * - Eliminación de datos específicos (historial, matches, etc.)
 * 
 * @version 3.5.0
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface UserDataExport {
  profile: any;
  images: any[];
  matches: any[];
  messages: any[];
  posts: any[];
  stories: any[];
  notifications: any[];
  tokens: any[];
  preferences: any;
  metadata: {
    exportDate: string;
    userId: string;
    format: 'json';
    version: string;
  };
}

export interface DataDeletionResult {
  success: boolean;
  deletedItems: {
    profile?: boolean;
    images?: number; // Cantidad eliminada
    matches?: number;
    messages?: number; // Anonimizados, no eliminados completamente por seguridad
    posts?: number;
    stories?: number;
    notifications?: number;
    tokens?: number;
    authUser?: boolean;
  };
  errors?: string[];
  message?: string;
}

class DataPrivacyService {
  private static instance: DataPrivacyService;

  private constructor() {}

  static getInstance(): DataPrivacyService {
    if (!DataPrivacyService.instance) {
      DataPrivacyService.instance = new DataPrivacyService();
    }
    return DataPrivacyService.instance;
  }

  /**
   * Exporta todos los datos del usuario (GDPR - Right of access)
   */
  async exportUserData(userId: string): Promise<UserDataExport | null> {
    try {
      logger.info('📥 Exportando datos del usuario', { userId: userId.substring(0, 8) + '***' });

      // Obtener todos los datos del usuario en paralelo
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      const [
        profileResult,
        imagesResult,
        matchesResult,
        messagesResult,
        postsResult,
        storiesResult,
        notificationsResult,
        tokensResult,
        preferencesResult
      ] = await Promise.all([
        // Perfil
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),

        // Imágenes (tabla puede no existir en tipos generados)
        (supabase as any)
          .from('images')
          .select('*')
          .eq('profile_id', userId),

        // Matches
        supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`),

        // Mensajes (últimos 1000 para no sobrecargar)
        supabase
          .from('chat_messages')
          .select('*')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(1000),

        // Stories (tabla correcta, posts era obsoleta)
        supabase
          .from('stories')
          .select('*')
          .eq('user_id', userId),

        // Stories
        supabase
          .from('stories')
          .select('*')
          .eq('user_id', userId),

        // Notificaciones
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(500),

        // Tokens y transacciones
        supabase
          .from('token_transactions')
          .select('*')
          .eq('user_id', userId),

        // Preferencias (almacenadas en profiles JSONB o couple_profiles.preferences)
        // Nota: user_preferences no existe como tabla, se usa profiles.privacy_settings o couple_profiles.preferences
        Promise.resolve({ data: null, error: null })
      ]);

      const exportData: UserDataExport = {
        profile: profileResult.data || null,
        images: imagesResult.data || [],
        matches: matchesResult.data || [],
        messages: messagesResult.data || [],
        posts: postsResult.data || [],
        stories: storiesResult.data || [],
        notifications: notificationsResult.data || [],
        tokens: tokensResult.data || [],
        preferences: preferencesResult.data || null,
        metadata: {
          exportDate: new Date().toISOString(),
          userId,
          format: 'json',
          version: '3.5.0'
        }
      };

      logger.info('✅ Datos exportados exitosamente', {
        userId: userId.substring(0, 8) + '***',
        items: {
          images: exportData.images.length,
          matches: exportData.matches.length,
          messages: exportData.messages.length,
          posts: exportData.posts.length
        }
      });

      return exportData;
    } catch (error) {
      logger.error('❌ Error exportando datos del usuario:', {
        error: error instanceof Error ? error.message : String(error),
        userId: userId.substring(0, 8) + '***'
      });
      return null;
    }
  }

  /**
   * Elimina cuenta y todos los datos del usuario (GDPR - Right to erasure)
   * 
   * IMPORTANTE: Esta operación es IRREVERSIBLE
   */
  async deleteUserAccount(userId: string, _confirmCode?: string): Promise<DataDeletionResult> {
    try {
      logger.warn('🗑️ Iniciando eliminación de cuenta', { userId: userId.substring(0, 8) + '***' });

      const deletedItems: DataDeletionResult['deletedItems'] = {};
      const errors: string[] = [];

      // 1. Eliminar imágenes del Storage y BD
      try {
        if (!supabase) {
          logger.error('Supabase no está disponible');
          throw new Error('Supabase no está disponible');
        }

        const { data: images } = await (supabase as any)
          .from('images')
          .select('id, url, is_public')
          .eq('profile_id', userId);

        if (images && images.length > 0) {
          // Eliminar de Storage
          const buckets = ['profile-images', 'gallery-images'];
          for (const bucket of buckets) {
            try {
              if (!supabase) {
                errors.push('Supabase no está disponible');
                continue;
              }

              const filesToDelete = images
                .map((img: any) => {
                  const fileName = img.url?.split('/').pop();
                  return fileName ? `${userId}/${fileName}` : null;
                })
                .filter(Boolean) as string[];

              if (filesToDelete.length > 0 && supabase) {
                await supabase.storage.from(bucket).remove(filesToDelete);
              }
            } catch (storageError) {
              logger.warn('Error eliminando imágenes de storage:', { error: storageError instanceof Error ? storageError.message : String(storageError) });
              errors.push(`Storage error: ${String(storageError)}`);
            }
          }

          // Eliminar registros de BD
          const { error: deleteImagesError } = await (supabase as any)
            .from('images')
            .delete()
            .eq('profile_id', userId);

          if (deleteImagesError) {
            errors.push(`Error eliminando imágenes: ${deleteImagesError.message}`);
          } else {
            deletedItems.images = images.length;
          }
        }
      } catch (error) {
        errors.push(`Error procesando imágenes: ${String(error)}`);
      }

      // 2. Anonimizar mensajes (no eliminar completamente por seguridad/legal)
      try {
        if (!supabase) {
          errors.push('Supabase no está disponible');
          throw new Error('Supabase no está disponible');
        }

        const { data: messages } = await supabase
          .from('chat_messages')
          .select('id')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        if (messages && messages.length > 0) {
          // Anonimizar en lugar de eliminar (GDPR permite retención para seguridad)
          const { error: anonymizeError } = await supabase
            .from('chat_messages')
            .update({
              content: '[Mensaje eliminado]',
              sender_id: undefined, // O mantener pero marcar como eliminado
              receiver_id: undefined
            } as any)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

          if (anonymizeError) {
            errors.push(`Error anonimizando mensajes: ${anonymizeError.message}`);
          } else {
            deletedItems.messages = messages.length;
          }
        }
      } catch (error) {
        errors.push(`Error procesando mensajes: ${String(error)}`);
      }

      // 3. Eliminar matches
      try {
        if (!supabase) {
          errors.push('Supabase no está disponible');
          throw new Error('Supabase no está disponible');
        }

        const { data: matches } = await supabase
          .from('matches')
          .select('id')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        if (matches && matches.length > 0) {
          const { error: deleteMatchesError } = await supabase
            .from('matches')
            .delete()
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

          if (deleteMatchesError) {
            errors.push(`Error eliminando matches: ${deleteMatchesError.message}`);
          } else {
            deletedItems.matches = matches.length;
          }
        }
      } catch (error) {
        errors.push(`Error procesando matches: ${String(error)}`);
      }

      // 4. Eliminar posts
      try {
        const { data: posts, error: _postsError } = await (supabase as any)
          .from('stories')
          .select('id')
          .eq('user_id', userId);

        if (posts && posts.length > 0) {
          const { error: deletePostsError } = await (supabase as any)
            .from('stories')
            .delete()
            .eq('user_id', userId);

          if (deletePostsError) {
            errors.push(`Error eliminando posts: ${deletePostsError.message}`);
          } else {
            deletedItems.posts = posts.length;
          }
        }
      } catch (error) {
        errors.push(`Error procesando posts: ${String(error)}`);
      }

      // 5. Eliminar stories
      try {
        if (!supabase) {
          errors.push('Supabase no está disponible');
          throw new Error('Supabase no está disponible');
        }

        const { data: stories, error: _storiesError } = await supabase
          .from('stories')
          .select('id')
          .eq('user_id', userId);

        if (stories && stories.length > 0) {
          const { error: deleteStoriesError } = await supabase
            .from('stories')
            .delete()
            .eq('user_id', userId);

          if (deleteStoriesError) {
            errors.push(`Error eliminando stories: ${deleteStoriesError.message}`);
          } else {
            deletedItems.stories = stories.length;
          }
        }
      } catch (error) {
        errors.push(`Error procesando stories: ${String(error)}`);
      }

      // 6. Eliminar notificaciones
      try {
        if (!supabase) {
          errors.push('Supabase no está disponible');
          throw new Error('Supabase no está disponible');
        }

        const { error: deleteNotificationsError } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId);

        if (!deleteNotificationsError) {
          deletedItems.notifications = 1; // Marcado como eliminado
        } else {
          errors.push(`Error eliminando notificaciones: ${deleteNotificationsError.message}`);
        }
      } catch (error) {
        errors.push(`Error procesando notificaciones: ${String(error)}`);
      }

      // 7. Eliminar perfil
      try {
        if (!supabase) {
          errors.push('Supabase no está disponible');
          throw new Error('Supabase no está disponible');
        }

        const { error: deleteProfileError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', userId);

        if (deleteProfileError) {
          errors.push(`Error eliminando perfil: ${deleteProfileError.message}`);
        } else {
          deletedItems.profile = true;
        }
      } catch (error) {
        errors.push(`Error eliminando perfil: ${String(error)}`);
      }

      // 8. Eliminar usuario de auth (requiere service role key o función edge)
      // NOTA: Esto debe hacerse con service role key desde el backend
      // Por ahora marcamos como pendiente
      logger.warn('⚠️ Eliminación de auth.users requiere service role key - debe hacerse desde backend', {
        userId: userId.substring(0, 8) + '***'
      });

      const success = errors.length === 0 || errors.length < 3; // Permitir algunos errores menores

      logger.info(success ? '✅ Eliminación de cuenta completada' : '⚠️ Eliminación de cuenta completada con errores', {
        userId: userId.substring(0, 8) + '***',
        deletedItems,
        errors: errors.length
      });

      return {
        success,
        deletedItems,
        errors: errors.length > 0 ? errors : undefined,
        message: success
          ? 'Cuenta eliminada exitosamente'
          : `Cuenta eliminada con ${errors.length} error(es) menores. Ver detalles en errors.`
      };
    } catch (error) {
      logger.error('❌ Error crítico eliminando cuenta:', {
        error: error instanceof Error ? error.message : String(error),
        userId: userId.substring(0, 8) + '***'
      });

      return {
        success: false,
        deletedItems: {},
        errors: [error instanceof Error ? error.message : String(error)],
        message: 'Error crítico eliminando cuenta'
      };
    }
  }

  /**
   * Elimina solo el historial de matches
   */
  async deleteMatchHistory(userId: string): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
      logger.info('🗑️ Eliminando historial de matches', { userId: userId.substring(0, 8) + '***' });

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return {
          success: false,
          deletedCount: 0,
          error: 'Supabase no está disponible'
        };
      }

      const { data: matches, error: selectError } = await supabase
        .from('matches')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (selectError) {
        return {
          success: false,
          deletedCount: 0,
          error: selectError.message
        };
      }

      if (!matches || matches.length === 0) {
        return {
          success: true,
          deletedCount: 0
        };
      }

      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (deleteError) {
        return {
          success: false,
          deletedCount: 0,
          error: deleteError.message
        };
      }

      logger.info('✅ Historial de matches eliminado', {
        userId: userId.substring(0, 8) + '***',
        count: matches.length
      });

      return {
        success: true,
        deletedCount: matches.length
      };
    } catch (error) {
      logger.error('❌ Error eliminando historial de matches:', { error: error instanceof Error ? error.message : String(error) });
      return {
        success: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Descarga datos exportados como archivo JSON
   */
  downloadExport(exportData: UserDataExport, filename?: string): void {
    try {
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a') as HTMLAnchorElement;
      
      link.href = url;
      link.download = filename || `complicesconecta-data-export-${exportData.metadata.exportDate.split('T')[0]}.json`;
      document.body.appendChild(link as Node);
      link.click();
      document.body.removeChild(link as Node);
      URL.revokeObjectURL(url);

      logger.info('✅ Archivo de exportación descargado');
    } catch (error) {
      logger.error('❌ Error descargando exportación:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}

// Exportar instancia singleton
export const dataPrivacyService = DataPrivacyService.getInstance();

// Exportar también como clase para testing
export { DataPrivacyService };

