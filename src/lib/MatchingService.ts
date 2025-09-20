// =====================================================
// MATCHING SERVICE - SUPABASE INTEGRATION
// Fecha: 14/09/2025 08:58hrs
// Versión: v2.8.1 - Servicio de Matching Real
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { 
  calculateCompatibility, 
  getSharedInterests, 
  generateMatchReasons,
  type MatchScore 
} from '@/lib/matching';

// Tipos para el servicio de matching
export interface SupabaseProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  age?: number;
  interests?: string[];
  avatar_url?: string;
  is_online?: boolean;
  last_active?: string;
  experience_level?: string;
  age_range_min?: number;
  age_range_max?: number;
  max_distance?: number;
  looking_for?: string[];
  latitude?: number;
  longitude?: number;
  gender?: string;
  bio?: string;
  is_premium?: boolean;
  account_type?: string;
}

export interface UserLike {
  id: string;
  user_id: string;
  liked_user_id: string;
  created_at: string;
  liked: boolean;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  shared_interests: string[];
  match_reasons: string[];
  created_at: string;
  last_interaction: string;
  is_active: boolean;
  other_user?: SupabaseProfile;
  unread_messages?: number;
}

export interface MatchInteraction {
  id: string;
  match_id: string;
  user_id: string;
  interaction_type: 'message' | 'like' | 'view' | 'block' | 'report';
  content?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export class MatchingService {
  
  // =====================================================
  // GESTIÓN DE LIKES
  // =====================================================
  
  /**
   * Dar like a un usuario
   */
  static async likeUser(likedUserId: string): Promise<{ success: boolean; match?: Match; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que no sea auto-like
      if (user.id === likedUserId) {
        return { success: false, error: 'No puedes darte like a ti mismo' };
      }

      // Verificar si ya existe el like
      const { data: existingLike } = await supabase
        .from('user_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('liked_user_id', likedUserId)
        .single();

      if (existingLike) {
        return { success: false, error: 'Ya has dado like a este usuario' };
      }

      // Crear el like
      const { error: likeError } = await supabase
        .from('user_likes')
        .insert({
          user_id: user.id,
          liked_user_id: likedUserId,
          liked: true
        });

      if (likeError) throw likeError;

      // Verificar si se creó un match (el trigger lo hace automáticamente)
      const { data: newMatch } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_user1_id_fkey(*),
          profiles!matches_user2_id_fkey(*)
        `)
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${likedUserId}),and(user1_id.eq.${likedUserId},user2_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return { 
        success: true, 
        match: newMatch ? this.formatMatch(newMatch, user.id) : undefined 
      };

    } catch (error) {
      logger.error('Error al dar like:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error al procesar el like' };
    }
  }

  /**
   * Quitar like a un usuario
   */
  static async unlikeUser(likedUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('user_likes')
        .update({ liked: false })
        .eq('user_id', user.id)
        .eq('liked_user_id', likedUserId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      logger.error('Error al quitar like:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error al quitar el like' };
    }
  }

  /**
   * Obtener likes dados por el usuario
   */
  static async getUserLikes(): Promise<UserLike[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('liked', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        user_id: item.user_id || '',
        liked_user_id: item.liked_user_id || '',
        created_at: item.created_at || '',
        liked: item.liked || false
      })) as UserLike[];

    } catch (error) {
      logger.error('Error al obtener likes:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  // =====================================================
  // GESTIÓN DE MATCHES
  // =====================================================

  /**
   * Obtener matches del usuario actual
   */
  static async getUserMatches(): Promise<Match[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Usar función RPC optimizada
      const { data, error } = await supabase
        .rpc('get_user_matches', { user_id: user.id });

      if (error) throw error;

      return ((data as unknown[]) || []).map((match: unknown) => {
        const m = match as Record<string, unknown>;
        return {
          id: String(m.match_id || ''),
          user1_id: user.id,
          user2_id: String(m.other_user_id || ''),
          compatibility_score: Number(m.compatibility_score || 0),
          shared_interests: Array.isArray(m.shared_interests) ? m.shared_interests as string[] : [],
          match_reasons: Array.isArray(m.match_reasons) ? m.match_reasons as string[] : [],
          created_at: String(m.created_at || new Date().toISOString()),
          last_interaction: String(m.last_interaction || new Date().toISOString()),
          is_active: true,
          other_user: {
            id: String(m.other_user_id || ''),
            name: String(m.other_user_name || 'Usuario'),
            avatar: String(m.other_user_avatar || '')
          },
          unread_messages: Number(m.unread_messages || 0)
        } as Match;
      });

    } catch (error) {
      logger.error('Error al obtener matches:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Obtener un match específico
   */
  static async getMatch(matchId: string): Promise<Match | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_user1_id_fkey(*),
          profiles!matches_user2_id_fkey(*)
        `)
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (error) throw error;
      return data ? this.formatMatch(data, user.id) : null;

    } catch (error) {
      logger.error('Error al obtener match:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // =====================================================
  // ALGORITMO DE MATCHING
  // =====================================================

  /**
   * Obtener perfiles potenciales para matching
   */
  static async getPotentialMatches(filters?: {
    maxDistance?: number;
    minAge?: number;
    maxAge?: number;
    limit?: number;
  }): Promise<SupabaseProfile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { 
        maxDistance = 50, 
        minAge = 18, 
        maxAge = 65, 
        limit = 20 
      } = filters || {};

      // Usar función RPC optimizada
      const { data, error } = await supabase
        .rpc('get_potential_matches', {
          user_id: user.id,
          max_distance: maxDistance,
          min_age: minAge,
          max_age: maxAge,
          limit_count: limit
        });

      if (error) throw error;

      return ((data as unknown[]) || []).map((profile: unknown) => {
        const p = profile as Record<string, unknown>;
        return {
          id: String(p.profile_id || ''),
          first_name: String(p.first_name || ''),
          last_name: String(p.last_name || ''),
          display_name: String(p.display_name || ''),
          age: Number(p.age || 0),
          interests: Array.isArray(p.interests) ? p.interests as string[] : [],
          avatar_url: String(p.avatar_url || ''),
          is_online: Boolean(p.is_online),
          last_active: String(p.last_active || '')
        };
      });

    } catch (error) {
      logger.error('Error al obtener perfiles potenciales:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Calcular compatibilidad con perfiles potenciales
   */
  static async getMatchesWithCompatibility(filters?: {
    maxDistance?: number;
    minAge?: number;
    maxAge?: number;
    limit?: number;
    minCompatibility?: number;
  }): Promise<(SupabaseProfile & { matchScore: MatchScore })[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Obtener perfil del usuario actual
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('interests')
        .eq('id', user.id)
        .single();

      const userInterests = userProfile ? (userProfile as { interests?: string[] }).interests || [] : [];

      // Obtener perfiles potenciales
      const potentialMatches = await this.getPotentialMatches(filters);

      // Calcular compatibilidad para cada perfil
      const matchesWithScores = potentialMatches
        .map(profile => {
          const matchScore = {
            profileId: profile.id,
            compatibilityScore: calculateCompatibility(userInterests, profile.interests || []),
            sharedInterests: getSharedInterests(userInterests, profile.interests || []),
            matchReasons: generateMatchReasons(getSharedInterests(userInterests, profile.interests || []))
          };

          return {
            ...profile,
            matchScore
          };
        })
        .filter(profile => profile.matchScore.compatibilityScore >= (filters?.minCompatibility || 20))
        .sort((a, b) => b.matchScore.compatibilityScore - a.matchScore.compatibilityScore);

      return matchesWithScores;

    } catch (error) {
      logger.error('Error al calcular compatibilidad:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  // =====================================================
  // INTERACCIONES DE MATCHES
  // =====================================================

  /**
   * Enviar mensaje en un match
   */
  static async sendMessage(matchId: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('match_interactions')
        .insert({
          match_id: matchId,
          user_id: user.id,
          interaction_type: 'message',
          content: content.trim(),
          metadata: { timestamp: new Date().toISOString() }
        });

      if (error) throw error;

      return { success: true };

    } catch (error) {
      logger.error('Error al enviar mensaje:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error al enviar el mensaje' };
    }
  }

  /**
   * Marcar match como visto
   */
  static async markMatchAsViewed(matchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('match_interactions')
        .insert({
          match_id: matchId,
          user_id: user.id,
          interaction_type: 'view',
          metadata: { viewed_at: new Date().toISOString() }
        });

      if (error) throw error;

      return { success: true };

    } catch (error) {
      logger.error('Error al marcar como visto:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error al marcar como visto' };
    }
  }

  /**
   * Obtener mensajes de un match
   */
  static async getMatchMessages(matchId: string, limit: number = 50): Promise<MatchInteraction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('match_interactions')
        .select('*')
        .eq('match_id', matchId)
        .eq('interaction_type', 'message')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        match_id: item.match_id || '',
        user_id: item.user_id || '',
        interaction_type: item.interaction_type || 'message'
      })).reverse() as MatchInteraction[]; // Mostrar mensajes más antiguos primero

    } catch (error) {
      logger.error('Error al obtener mensajes:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  // =====================================================
  // GESTIÓN DE PERFIL
  // =====================================================

  /**
   * Actualizar intereses del usuario
   */
  static async updateUserInterests(interests: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({ interests })
        .eq('id', user.id);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      logger.error('Error al actualizar intereses:', { error: error instanceof Error ? error.message : String(error) });
      return { success: false, error: 'Error al actualizar intereses' };
    }
  }

  /**
   * Actualizar estado online del usuario
   */
  static async updateOnlineStatus(isOnline: boolean = true): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('update_user_activity', {
        user_id: user.id,
        is_online: isOnline
      });

    } catch (error) {
      logger.error('Error al actualizar estado online:', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // =====================================================
  // UTILIDADES PRIVADAS
  // =====================================================

  /**
   * Formatear match para el frontend
   */
  private static formatMatch(rawMatch: Record<string, unknown>, currentUserId: string): Match {
    const otherUserId = String(rawMatch.user1_id) === currentUserId ? String(rawMatch.user2_id) : String(rawMatch.user1_id);
    const otherUserProfile = rawMatch.user1_id === currentUserId 
      ? rawMatch.profiles_user2_id as Record<string, unknown>
      : rawMatch.profiles_user1_id as Record<string, unknown>;

    return {
      id: String(rawMatch.id || ''),
      user1_id: String(rawMatch.user1_id || ''),
      user2_id: String(rawMatch.user2_id || ''),
      compatibility_score: Number(rawMatch.compatibility_score || 0),
      shared_interests: Array.isArray(rawMatch.shared_interests) ? rawMatch.shared_interests as string[] : [],
      match_reasons: Array.isArray(rawMatch.match_reasons) ? rawMatch.match_reasons as string[] : [],
      created_at: String(rawMatch.created_at || ''),
      last_interaction: String(rawMatch.last_interaction || ''),
      is_active: Boolean(rawMatch.is_active),
      other_user: otherUserProfile ? {
        id: otherUserId,
        first_name: String(otherUserProfile.first_name || ''),
        last_name: String(otherUserProfile.last_name || ''),
        display_name: String(otherUserProfile.display_name || ''),
        avatar_url: String(otherUserProfile.avatar_url || ''),
        age: Number(otherUserProfile.age || 0),
        interests: Array.isArray(otherUserProfile.interests) ? otherUserProfile.interests as string[] : []
      } : undefined
    };
  }

  // =====================================================
  // SUSCRIPCIONES REALTIME
  // =====================================================

  /**
   * Suscribirse a nuevos matches
   */
  static subscribeToMatches(callback: (match: Match) => void) {
    return supabase
      .channel('matches')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'matches' 
        }, 
        (payload) => {
          logger.info('Nuevo match:', payload);
          // ✅ PLANIFICADO: Formatear match en próxima iteración de real-time matching
        }
      )
      .subscribe();
  }

  /**
   * Suscribirse a mensajes de un match
   */
  static subscribeToMatchMessages(matchId: string, callback: (message: MatchInteraction) => void) {
    return supabase
      .channel(`match_${matchId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_interactions',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          if (payload.new.interaction_type === 'message') {
            callback(payload.new as MatchInteraction);
          }
        }
      )
      .subscribe();
  }
}

export default MatchingService;
