// =====================================================
// MATCHING SERVICE - SUPABASE INTEGRATION
// Fecha: 14/09/2025 08:58hrs
// Versión: v2.8.1 - Servicio de Matching Real
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { 
  calculateCompatibility, 
  getSharedInterests, 
  generateMatchReasons,
  MatchScore 
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
}

export interface UserLike {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
  is_active: boolean;
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
  metadata?: Record<string, any>;
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
        .eq('liker_id', user.id)
        .eq('liked_id', likedUserId)
        .single();

      if (existingLike) {
        return { success: false, error: 'Ya has dado like a este usuario' };
      }

      // Crear el like
      const { error: likeError } = await supabase
        .from('user_likes')
        .insert({
          liker_id: user.id,
          liked_id: likedUserId,
          is_active: true
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
      console.error('Error al dar like:', error);
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
        .update({ is_active: false })
        .eq('liker_id', user.id)
        .eq('liked_id', likedUserId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error al quitar like:', error);
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
        .eq('liker_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error al obtener likes:', error);
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

      // Usar la función SQL helper
      const { data, error } = await supabase
        .rpc('get_user_matches', { user_id: user.id });

      if (error) throw error;

      return (data || []).map((match: any) => ({
        id: match.match_id,
        user1_id: user.id,
        user2_id: match.other_user_id,
        compatibility_score: match.compatibility_score,
        shared_interests: match.shared_interests,
        match_reasons: match.match_reasons,
        created_at: match.last_interaction,
        last_interaction: match.last_interaction,
        is_active: true,
        other_user: {
          id: match.other_user_id,
          display_name: match.other_user_name,
          avatar_url: match.other_user_avatar
        },
        unread_messages: match.unread_messages
      }));

    } catch (error) {
      console.error('Error al obtener matches:', error);
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
      console.error('Error al obtener match:', error);
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

      // Usar la función SQL helper
      const { data, error } = await supabase
        .rpc('get_potential_matches', {
          user_id: user.id,
          max_distance: maxDistance,
          min_age: minAge,
          max_age: maxAge,
          limit_count: limit
        });

      if (error) throw error;

      return (data || []).map((profile: any) => ({
        id: profile.profile_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: profile.display_name,
        age: profile.age,
        interests: profile.interests || [],
        avatar_url: profile.avatar_url,
        is_online: profile.is_online,
        last_active: profile.last_active
      }));

    } catch (error) {
      console.error('Error al obtener perfiles potenciales:', error);
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

      const userInterests = userProfile?.interests || [];

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
      console.error('Error al calcular compatibilidad:', error);
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
      console.error('Error al enviar mensaje:', error);
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
      console.error('Error al marcar como visto:', error);
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
      return (data || []).reverse(); // Mostrar mensajes más antiguos primero

    } catch (error) {
      console.error('Error al obtener mensajes:', error);
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
      console.error('Error al actualizar intereses:', error);
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
      console.error('Error al actualizar estado online:', error);
    }
  }

  // =====================================================
  // UTILIDADES PRIVADAS
  // =====================================================

  /**
   * Formatear match para el frontend
   */
  private static formatMatch(rawMatch: any, currentUserId: string): Match {
    const otherUserId = rawMatch.user1_id === currentUserId ? rawMatch.user2_id : rawMatch.user1_id;
    const otherUserProfile = rawMatch.user1_id === currentUserId 
      ? rawMatch.profiles_user2_id 
      : rawMatch.profiles_user1_id;

    return {
      id: rawMatch.id,
      user1_id: rawMatch.user1_id,
      user2_id: rawMatch.user2_id,
      compatibility_score: rawMatch.compatibility_score,
      shared_interests: rawMatch.shared_interests || [],
      match_reasons: rawMatch.match_reasons || [],
      created_at: rawMatch.created_at,
      last_interaction: rawMatch.last_interaction,
      is_active: rawMatch.is_active,
      other_user: otherUserProfile ? {
        id: otherUserId,
        first_name: otherUserProfile.first_name,
        last_name: otherUserProfile.last_name,
        display_name: otherUserProfile.display_name,
        avatar_url: otherUserProfile.avatar_url,
        age: otherUserProfile.age,
        interests: otherUserProfile.interests
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
          console.log('Nuevo match:', payload);
          // TODO: Formatear y enviar el match al callback
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
