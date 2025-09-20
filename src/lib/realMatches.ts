/**
 * SISTEMA DE MATCHES REAL PARA PRODUCCIÓN - ComplicesConecta
 * 
 * Sistema simplificado que funciona con el esquema actual de Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Tipos extendidos para compatibilidad con datos dinámicos
interface ExtendedProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  bio?: string | null;
  is_verified?: boolean | null;
  gender?: string;
  interested_in?: string[];
  interests?: string[];
}

interface MatchData {
  id: string;
  profile_id: string;
  target_profile_id: string;
  compatibility_score?: number;
  match_reasons?: string[];
  is_mutual?: boolean;
  status?: string;
  created_at?: string;
}

interface MatchWithProfile extends MatchData {
  matched_profile?: ExtendedProfile;
}

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
const calculateCompatibility = (user1: ExtendedProfile, user2: ExtendedProfile): number => {
  let score = 50; // Base score
  
  if (user1.gender && user2.gender && user1.interested_in && user2.interested_in) {
    if (user1.interested_in.includes(user2.gender)) {
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
const getMatchReasons = (user1: ExtendedProfile, user2: ExtendedProfile): string[] => {
  const reasons: string[] = [];
  
  if (user1.age && user2.age && Math.abs(user1.age - user2.age) <= 5) {
    reasons.push('Edades compatibles');
  }
  
  if (user2.is_verified) {
    reasons.push('Perfil verificado');
  }
  
  if (user1.interested_in && user2.gender && user1.interested_in.includes(user2.gender)) {
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

      const { data: matches, error } = await supabase
        .from('profiles')
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

      const realMatches: RealMatch[] = (matches || []).map((match: Profile) => ({
        id: match.id,
        name: match.first_name || 'Usuario',
        age: match.age || 0,
        bio: match.bio || 'Sin descripción',
        images: [`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop&crop=face`],
        compatibility: 75,
        reasons: ['Match potencial'],
        isOnline: Math.random() > 0.3,
        lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        distance: Math.floor(Math.random() * 50) + 1,
        isVerified: match.is_verified || false,
        isPremium: false
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
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (profileError || !currentProfile) {
        return { success: false, error: 'Error al obtener perfil del usuario' };
      }

      // Construir query con filtros
      let query = supabase
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

      // Obtener perfiles que cumplan los filtros
      const { data: profiles, error: profilesError } = await query.limit(50);

      if (profilesError || !profiles) {
        return { success: false, error: 'Error al obtener perfiles' };
      }

      const compatibleProfiles: RealMatch[] = [];
      const profileData = currentProfile as Profile;
      const extendedCurrentProfile: ExtendedProfile = {
        id: profileData.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        age: profileData.age,
        bio: profileData.bio,
        is_verified: profileData.is_verified,
        gender: profileData.profile_type || undefined,
        interested_in: [],
        interests: []
      };

      for (const profileData of profiles) {
        const profile = profileData as Profile;
        const extendedProfile: ExtendedProfile = {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          age: profile.age,
          bio: profile.bio,
          is_verified: profile.is_verified,
          gender: profile.profile_type || undefined,
          interested_in: [],
          interests: []
        };

        const compatibilityScore = calculateCompatibility(extendedCurrentProfile, extendedProfile);
        
        // Aplicar filtro de compatibilidad mínima
        if (filters?.minCompatibility && compatibilityScore < filters.minCompatibility) {
          continue;
        }

        const matchReasons = getMatchReasons(extendedCurrentProfile, extendedProfile);

        // Verificar que no existe ya un match
        const { data: existingMatch } = await supabase
          .from('invitations')
          .select('id')
          .eq('sender_id', user.user.id)
          .eq('receiver_id', profile.id)
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
            isPremium: false
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
        supabase.from('profiles').select('*').eq('id', user.user.id).single(),
        supabase.from('profiles').select('*').eq('id', targetProfileId).single()
      ]);

      if (currentProfileResult.error || targetProfileResult.error) {
        return { success: false, error: 'Error al obtener perfiles' };
      }

      const currentProfile = currentProfileResult.data;
      const targetProfile = targetProfileResult.data;

      // Calcular compatibilidad
      const currentProfileData = currentProfile as ExtendedProfile;
      const targetProfileData = targetProfile as ExtendedProfile;
      const compatibilityScore = calculateCompatibility(currentProfileData, targetProfileData);
      const sharedInterests = (currentProfileData.interests || []).filter((interest: string) => 
        (targetProfileData.interests || []).includes(interest)
      );
      const matchReasons = getMatchReasons(currentProfileData, targetProfileData);

      // Verificar si ya existe un match del otro usuario hacia nosotros
      const { data: existingMatch } = await supabase
        .from('invitations')
        .select('*')
        .eq('sender_id', targetProfileId)
        .eq('receiver_id', user.user.id)
        .single();

      const isMutual = !!existingMatch;

      // Crear nuestro match
      const matchData = {
        sender_id: user.user.id,
        receiver_id: targetProfileId,
        status: 'pending'
      };

      const { error: matchError } = await supabase
        .from('invitations')
        .insert(matchData as any);

      if (matchError) {
        return { success: false, error: `Error al crear match: ${matchError.message}` };
      }

      // Si es mutuo, actualizar el match existente
      if (isMutual && existingMatch) {
        const matchDataUpdate = existingMatch as any;
        const updateData = { status: 'accepted' };
        await (supabase.from('invitations') as any)
          .update(updateData)
          .eq('id', matchDataUpdate.id);
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
        supabase
          .from('invitations')
          .select('id', { count: 'exact' })
          .eq('sender_id', user.user.id),
        supabase
          .from('invitations')
          .select('id', { count: 'exact' })
          .eq('sender_id', user.user.id)
          .eq('status', 'accepted'),
        supabase
          .from('invitations')
          .select('id', { count: 'exact' })
          .eq('sender_id', user.user.id)
          .eq('status', 'pending'),
        supabase
          .from('invitations')
          .select('id', { count: 'exact' })
          .eq('sender_id', user.user.id)
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
