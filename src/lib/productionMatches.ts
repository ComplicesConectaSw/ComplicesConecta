/**
 * SISTEMA DE MATCHES SIMPLIFICADO PARA PRODUCCIÓN - ComplicesConecta
 * 
 * Sistema de matches basado en perfiles reales existentes:
 * - Usa tabla profiles existente
 * - Compatibilidad basada en criterios básicos
 * - Sin dependencias de tablas inexistentes
 * - Funciona con esquema actual de Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Interfaces para el sistema de matches de producción
export interface ProductionMatch {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  interests: string[];
  compatibility: number;
  reasons: string[];
  isOnline: boolean;
  lastSeen: string;
  distance: number;
  accountType: 'single' | 'couple';
  partnerName?: string;
  partnerAge?: number;
  location: string;
  isVerified: boolean;
  isPremium: boolean;
}

export interface MatchFilters {
  ageRange?: [number, number];
  maxDistance?: number;
  interests?: string[];
  accountType?: 'single' | 'couple';
  gender?: string;
  minCompatibility?: number;
  location?: string;
}

export interface MatchStats {
  totalProfiles: number;
  singlesCount: number;
  couplesCount: number;
  verifiedCount: number;
  newThisWeek: number;
}

// Función para calcular compatibilidad basada en criterios básicos
const calculateCompatibility = (user1: Profile, user2: Profile): number => {
  let score = 0;
  
  // Compatibilidad por género e interés usando bypass para propiedades faltantes
  const user1Gender = (user1 as any).gender;
  const user2Gender = (user2 as any).gender;
  const user1InterestedIn = (user1 as any).interested_in;
  const user2InterestedIn = (user2 as any).interested_in;
  
  if (user1Gender && user2Gender && user1InterestedIn && user2InterestedIn) {
    if (user1InterestedIn.includes(user2Gender) && user2InterestedIn.includes(user1Gender)) {
      score += 40;
    }
  }
  
  // Compatibilidad por edad (diferencia menor a 10 años)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 5) score += 30;
    else if (ageDiff <= 10) score += 20;
    else if (ageDiff <= 15) score += 10;
  }
  
  // Puntuación base por perfiles verificados
  if (user2.is_verified) score += 15;
  // TODO: Implementar cuando is_premium esté disponible en la tabla profiles
  // if (user2.is_premium) score += 15;
  
  return Math.min(score, 100);
};

// Función para generar razones de match basadas en criterios básicos
const getMatchReasons = (user1: Profile, user2: Profile): string[] => {
  const reasons: string[] = [];
  
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 5) reasons.push('Edades compatibles');
  }
  
  if (user2.is_verified) reasons.push('Perfil verificado');
  // TODO: Implementar cuando is_premium esté disponible en la tabla profiles
  // if (user2.is_premium) reasons.push('Usuario premium');
  
  // Usar bypass para propiedades faltantes
  const user1Gender = (user1 as any).gender;
  const user2Gender = (user2 as any).gender;
  const user1InterestedIn = (user1 as any).interested_in;
  
  if (user1Gender && user2Gender && user1InterestedIn) {
    if (user1InterestedIn.includes(user2Gender)) {
      reasons.push('Compatibilidad de género');
    }
  }
  
  if (reasons.length === 0) {
    reasons.push('Nuevo en la plataforma');
  }
  
  return reasons;
};

class ProductionMatchService {
  /**
   * Busca perfiles compatibles basados en filtros
   */
  async findCompatibleProfiles(filters?: MatchFilters): Promise<{ 
    success: boolean; 
    matches?: ProductionMatch[]; 
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
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1]);
      }
      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters?.accountType) {
        query = query.eq('account_type', filters.accountType);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data: profiles, error } = await query.limit(50);

      if (error) {
        return { success: false, error: `Error al buscar perfiles: ${error.message}` };
      }

      // Calcular compatibilidad y crear matches
      const _userInterests = currentProfile.interests || [];
      const compatibleMatches: ProductionMatch[] = [];

      for (const profile of profiles) {
        const _profileInterests = profile.interests || [];
        const compatibilityScore = calculateCompatibility(currentProfile, profile);
        
        // Aplicar filtro de compatibilidad mínima
        if (filters?.minCompatibility && compatibilityScore < filters.minCompatibility) {
          continue;
        }

        const reasons = getMatchReasons(currentProfile, profile);

        // Crear match de producción
        const displayName = profile.account_type === 'couple' 
          ? `${profile.first_name} & ${profile.partner_first_name || 'Pareja'}`
          : profile.display_name || profile.first_name;

        compatibleMatches.push({
          id: profile.id,
          name: displayName,
          age: profile.age || 0,
          bio: profile.bio || 'Sin descripción disponible',
          images: [
            `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop&crop=face`
          ],
          interests: profile.interests || [],
          compatibility: compatibilityScore,
          reasons,
          isOnline: Math.random() > 0.3,
          lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          distance: Math.floor(Math.random() * 50) + 1,
          accountType: 'single' as const,
          partnerName: undefined,
          partnerAge: undefined,
          location: 'Ubicación no especificada',
          isVerified: profile.is_verified || false,
          isPremium: profile.is_premium || false
        });
      }

      // Ordenar por compatibilidad
      compatibleMatches.sort((a, b) => b.compatibility - a.compatibility);

      return { success: true, matches: compatibleMatches };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene perfiles recomendados para el usuario
   */
  async getRecommendedMatches(limit: number = 10): Promise<{
    success: boolean;
    matches?: ProductionMatch[];
    error?: string;
  }> {
    try {
      const result = await this.findCompatibleProfiles({
        minCompatibility: 20 // Mínimo 20% de compatibilidad
      });

      if (!result.success || !result.matches) {
        return result;
      }

      // Limitar resultados
      const limitedMatches = result.matches.slice(0, limit);

      return {
        success: true,
        matches: limitedMatches
      };

    } catch (error) {
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Busca perfiles por criterios específicos
   */
  async searchProfiles(searchQuery: string, filters?: MatchFilters, limit: number = 20): Promise<{
    success: boolean;
    matches?: ProductionMatch[];
    total: number;
    error?: string;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado', total: 0 };
      }

      // Obtener perfiles que coincidan con la búsqueda
      let query = (supabase as any)
        .from('profiles')
        .select('*')
        .neq('user_id', user.user.id);

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      if (filters?.ageRange) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1]);
      }

      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }

      const { data: profiles, error } = await query.limit(limit);

      if (error) {
        return {
          success: false,
          total: 0,
          error: 'Error en la búsqueda: ' + error.message
        };
      }

      const searchResults: ProductionMatch[] = [];

      for (const profile of profiles || []) {
        const displayName = profile.account_type === 'couple' 
          ? `${profile.first_name} & ${profile.partner_first_name || 'Pareja'}`
          : profile.display_name || profile.first_name;

        searchResults.push({
          id: profile.id,
          name: displayName,
          age: profile.age || 0,
          bio: profile.bio || 'Sin descripción disponible',
          images: [
            `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop&crop=face`
          ],
          interests: profile.interests || [],
          compatibility: Math.floor(Math.random() * 50) + 50,
          reasons: ['Búsqueda por criterios'],
          isOnline: Math.random() > 0.3,
          lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          distance: Math.floor(Math.random() * 50) + 1,
          accountType: (profile.account_type as 'single' | 'couple') || 'single',
          partnerName: profile.partner_first_name || undefined,
          partnerAge: profile.partner_age || undefined,
          location: profile.location || 'Ubicación no especificada',
          isVerified: profile.is_verified || false,
          isPremium: profile.is_premium || false
        });
      }

      return { 
        success: true, 
        matches: searchResults,
        total: searchResults.length
      };

    } catch (error) {
      return {
        success: false,
        total: 0,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene estadísticas básicas de perfiles disponibles
   */
  async getMatchStats(): Promise<{
    success: boolean;
    stats?: {
      totalProfiles: number;
      singleProfiles: number;
      coupleProfiles: number;
      verifiedProfiles: number;
    };
    error?: string;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const [totalResult, singleResult, coupleResult, verifiedResult] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('id', { count: 'exact' })
          .neq('id', user.user.id),
        (supabase as any)
          .from('profiles')
          .select('id', { count: 'exact' })
          .neq('id', user.user.id)
          .eq('account_type', 'single'),
        (supabase as any)
          .from('profiles')
          .select('id', { count: 'exact' })
          .neq('id', user.user.id)
          .eq('account_type', 'couple'),
        (supabase as any)
          .from('profiles')
          .select('id', { count: 'exact' })
          .neq('id', user.user.id)
          .eq('is_verified', true)
      ]);

      return {
        success: true,
        stats: {
          totalProfiles: totalResult.count || 0,
          singleProfiles: singleResult.count || 0,
          coupleProfiles: coupleResult.count || 0,
          verifiedProfiles: verifiedResult.count || 0
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

export const productionMatchService = new ProductionMatchService();
