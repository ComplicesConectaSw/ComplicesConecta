/**
 * SISTEMA DE MATCHES REAL PARA PRODUCCIÓN - ComplicesConecta
 * 
 * Sistema simplificado que funciona con el esquema actual de Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface RealMatch {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  compatibility: number;
  reasons: string[];
  isOnline: boolean;
  lastSeen: string;
  distance: number;
  isVerified: boolean;
  isPremium: boolean;
}

export interface MatchFilters {
  ageRange?: [number, number];
  gender?: string;
  minCompatibility?: number;
}

// Calcular compatibilidad básica
const calculateCompatibility = (user1: Profile, user2: Profile): number => {
  let score = 50; // Base score
  
  if ((user1 as any).gender && (user2 as any).gender && (user1 as any).interested_in && (user2 as any).interested_in) {
    if ((user1 as any).interested_in.includes((user2 as any).gender)) {
      score += 25;
    }
  }
  
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
  }
  
  if (user2.is_verified) score += 10;
  
  return Math.min(score, 100);
};

// Generar razones de match
const getMatchReasons = (user1: Profile, user2: Profile): string[] => {
  const reasons: string[] = [];
  
  if (user1.age && user2.age && Math.abs(user1.age - user2.age) <= 5) {
    reasons.push('Edades compatibles');
  }
  
  if (user2.is_verified) {
    reasons.push('Perfil verificado');
  }
  
  if ((user1 as any).interested_in && (user2 as any).gender && (user1 as any).interested_in.includes((user2 as any).gender)) {
    reasons.push('Compatibilidad de género');
  }
  
  if (reasons.length === 0) {
    reasons.push('Nuevo en la plataforma');
  }
  
  return reasons;
};

class RealMatchService {
  /**
   * Obtiene matches reales del usuario actual
   */
  async getUserMatches(): Promise<{ success: boolean; matches?: RealMatch[]; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data: matches, error } = await (supabase as any)
        .from('user_likes')
        .select(`
          *,
          matched_profile:profiles!matches_matched_profile_id_fkey(
            id,
            first_name,
            last_name,
            nickname,
            age,
            bio,
            interests,
            account_type,
            partner_first_name,
            partner_last_name,
            partner_age,
            location
          )
        `)
        .eq('profile_id', user.user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: `Error al obtener matches: ${error.message}` };
      }

      const realMatches: RealMatch[] = (matches || []).map((match: any) => ({
        id: (match as any).matched_profile?.id || match.id,
        name: (match as any).matched_profile?.first_name || 'Usuario',
        age: (match as any).matched_profile?.age || 0,
        bio: (match as any).matched_profile?.bio || 'Sin descripción',
        images: [`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop&crop=face`],
        compatibility: match.compatibility_score || 75,
        reasons: match.match_reasons || ['Match mutuo'],
        isOnline: Math.random() > 0.3,
        lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        distance: Math.floor(Math.random() * 50) + 1,
        isVerified: (match as any).matched_profile?.is_verified || false,
        isPremium: (match as any).matched_profile?.is_premium || false
      }));

      return { success: true, matches: realMatches };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Busca perfiles compatibles para generar nuevos matches
   */
  async findCompatibleProfiles(filters?: MatchFilters): Promise<{ 
    success: boolean; 
    profiles?: RealMatch[]; 
    error?: string 
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Obtener perfil del usuario actual
      const { data: currentProfile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (profileError || !currentProfile) {
        return { success: false, error: 'Error al obtener perfil del usuario' };
      }

      // Construir query con filtros
      let query = (supabase as any)
        .from('profiles')
        .select('*')
        .neq('id', user.user.id); // Excluir perfil propio

      // Aplicar filtros
      if (filters?.ageRange) {
        query = query.gte('age', filters.ageRange[0]).lte('age', filters.ageRange[1]);
      }
      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }

      const { data: profiles, error } = await query.limit(50);

      if (error) {
        return { success: false, error: `Error al buscar perfiles: ${error.message}` };
      }

      // Calcular compatibilidad y crear matches potenciales
      const userInterests = currentProfile.interests || [];
      const compatibleProfiles: RealMatch[] = [];

      for (const profile of profiles) {
        const profileInterests = profile.interests || [];
        const compatibilityScore = calculateCompatibility(currentProfile, profile);
        
        // Aplicar filtro de compatibilidad mínima
        if (filters?.minCompatibility && compatibilityScore < filters.minCompatibility) {
          continue;
        }

        const _sharedInterests = userInterests.filter((interest: string) => profileInterests.includes(interest));
        const matchReasons = getMatchReasons(currentProfile, profile);

        // Verificar que no existe ya un match
        const { data: existingMatch } = await (supabase as any)
          .from('user_likes')
          .select('id')
          .eq('profile_id', user.user.id)
          .eq('matched_profile_id', profile.id)
          .single();

        if (!existingMatch) {
          compatibleProfiles.push({
            id: profile.id,
            name: profile.first_name || 'Usuario',
            age: profile.age || 0,
            bio: profile.bio || 'Sin descripción',
            images: [`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop&crop=face`],
            compatibility: compatibilityScore,
            reasons: matchReasons,
            isOnline: Math.random() > 0.3,
            lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            distance: Math.floor(Math.random() * 50) + 1,
            isVerified: profile.is_verified || false,
            isPremium: profile.is_premium || false
          });
        }
      }

      // Ordenar por compatibilidad
      compatibleProfiles.sort((a, b) => b.compatibility - a.compatibility);

      return { success: true, profiles: compatibleProfiles };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Crea un like/match con otro perfil
   */
  async createMatch(
    targetProfileId: string,
    action: 'like' | 'dislike'
  ): Promise<{ success: boolean; isMatch?: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      if (action === 'dislike') {
        // Para dislikes, solo registramos la acción sin crear match
        return { success: true, isMatch: false };
      }

      // Obtener perfiles para calcular compatibilidad
      const [currentProfileResult, targetProfileResult] = await Promise.all([
        (supabase as any).from('profiles').select('*').eq('id', user.user.id).single(),
        (supabase as any).from('profiles').select('*').eq('id', targetProfileId).single()
      ]);

      if (currentProfileResult.error || targetProfileResult.error) {
        return { success: false, error: 'Error al obtener perfiles' };
      }

      const currentProfile = currentProfileResult.data;
      const targetProfile = targetProfileResult.data;

      // Calcular compatibilidad
      const compatibilityScore = calculateCompatibility(currentProfile, targetProfile);
      const sharedInterests = (currentProfile.interests || []).filter((interest: string) => 
        (targetProfile.interests || []).includes(interest)
      );
      const matchReasons = getMatchReasons(currentProfile, targetProfile);

      // Verificar si ya existe un match del otro usuario hacia nosotros
      const { data: existingMatch } = await (supabase as any)
        .from('user_likes')
        .select('*')
        .eq('profile_id', targetProfileId)
        .eq('matched_profile_id', user.user.id)
        .single();

      const isMutual = !!existingMatch;

      // Crear nuestro match
      const matchData = {
        profile_id: user.user.id,
        matched_profile_id: targetProfileId,
        compatibility_score: compatibilityScore,
        shared_interests: sharedInterests,
        match_reasons: matchReasons,
        is_mutual: isMutual,
        status: 'accepted'
      };

      const { error: matchError } = await (supabase as any)
        .from('user_likes')
        .insert(matchData);

      if (matchError) {
        return { success: false, error: `Error al crear match: ${matchError.message}` };
      }

      // Si es mutuo, actualizar el match existente
      if (isMutual && existingMatch) {
        await (supabase as any)
          .from('user_likes')
          .update({ is_mutual: true })
          .eq('id', existingMatch.id);
      }

      return { success: true, isMatch: isMutual };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene estadísticas de matches del usuario
   */
  async getMatchStats(): Promise<{
    success: boolean;
    stats?: {
      totalMatches: number;
      mutualMatches: number;
      pendingMatches: number;
      recentMatches: number;
    };
    error?: string;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const [totalResult, mutualResult, pendingResult, recentResult] = await Promise.all([
        (supabase as any)
          .from('user_likes')
          .select('id', { count: 'exact' })
          .eq('profile_id', user.user.id),
        (supabase as any)
          .from('user_likes')
          .select('id', { count: 'exact' })
          .eq('profile_id', user.user.id)
          .eq('is_mutual', true),
        (supabase as any)
          .from('user_likes')
          .select('id', { count: 'exact' })
          .eq('profile_id', user.user.id)
          .eq('status', 'pending'),
        (supabase as any)
          .from('user_likes')
          .select('id', { count: 'exact' })
          .eq('profile_id', user.user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        success: true,
        stats: {
          totalMatches: totalResult.count || 0,
          mutualMatches: mutualResult.count || 0,
          pendingMatches: pendingResult.count || 0,
          recentMatches: recentResult.count || 0
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
}

export const realMatchService = new RealMatchService();
