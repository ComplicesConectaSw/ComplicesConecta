/**
 * SmartMatchingService - Servicio unificado para matching inteligente
 * 
 * Conecta el algoritmo de matching (smartMatchingEngine) con la base de datos
 * Proporciona API centralizada para buscar matches desde cualquier parte de la app
 * 
 * @version 3.5.0
 */

import { smartMatchingEngine, type UserProfile, type MatchScore, type MatchingContext } from '@/lib/ai/smartMatching';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { neo4jService } from './graph/Neo4jService';

export interface MatchFilters {
  ageRange?: { min: number; max: number };
  gender?: string[];
  maxDistance?: number; // km
  minScore?: number;
  verifiedOnly?: boolean;
  hasPhotos?: boolean;
  interests?: string[];
}

export interface MatchSearchOptions {
  limit?: number;
  offset?: number;
  filters?: MatchFilters;
  context?: MatchingContext;
  excludeMatched?: boolean; // Excluir usuarios que ya tienen match
}

export interface MatchSearchResult {
  matches: MatchScore[];
  total: number;
  stats: {
    totalCandidates: number;
    matchesFound: number;
    averageScore: number;
    highQualityMatches: number; // Score >= 70
  };
}

class SmartMatchingService {
  private static instance: SmartMatchingService;

  private constructor() {}

  static getInstance(): SmartMatchingService {
    if (!SmartMatchingService.instance) {
      SmartMatchingService.instance = new SmartMatchingService();
    }
    return SmartMatchingService.instance;
  }

  /**
   * Busca matches para un usuario
   */
  async findMatches(
    userId: string,
    options: MatchSearchOptions = {}
  ): Promise<MatchSearchResult> {
    try {
      logger.info('🔍 Buscando matches para usuario', { userId: userId.substring(0, 8) + '***' });

      // 1. Obtener perfil del usuario
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        logger.warn('Perfil de usuario no encontrado', { userId });
        return this.emptyResult();
      }

      // 2. Obtener candidatos desde BD
      const candidates = await this.getCandidates(userId, options);
      logger.info('Candidatos encontrados', { count: candidates.length });

      // 3. Convertir a UserProfile y calcular matches
      const userProfiles = candidates.map(c => this.mapToUserProfile(c)).filter(Boolean) as UserProfile[];
      
      const matches = smartMatchingEngine.findBestMatches(
        userProfile,
        userProfiles,
        options.limit || 20,
        options.context
      );

      // 4. Enriquecer con conexiones sociales (Neo4j) si está habilitado
      const enrichedMatches = await this.enrichWithSocialConnections(
        userId,
        matches,
        options
      );

      // 5. Filtrar por score mínimo (incluyendo social score)
      const minScore = options.filters?.minScore || 30;
      const filteredMatches = enrichedMatches.filter(m => {
        const totalScore = m.totalScore + (m.socialScore || 0);
        return totalScore >= minScore;
      });

      // 6. Ordenar por score total (compatibility + social)
      filteredMatches.sort((a, b) => {
        const scoreA = a.totalScore + (a.socialScore || 0);
        const scoreB = b.totalScore + (b.socialScore || 0);
        return scoreB - scoreA;
      });

      // 7. Calcular estadísticas
      const stats = {
        totalCandidates: candidates.length,
        matchesFound: filteredMatches.length,
        averageScore: filteredMatches.length > 0
          ? Math.round(filteredMatches.reduce((sum, m) => sum + m.totalScore + (m.socialScore || 0), 0) / filteredMatches.length)
          : 0,
        highQualityMatches: filteredMatches.filter(m => m.totalScore + (m.socialScore || 0) >= 70).length
      };

      const isNeo4jEnabled = typeof import.meta !== 'undefined' && import.meta.env 
        ? import.meta.env.VITE_NEO4J_ENABLED === 'true'
        : process.env.VITE_NEO4J_ENABLED === 'true';
      
      logger.info('✅ Matches encontrados', {
        userId: userId.substring(0, 8) + '***',
        total: filteredMatches.length,
        avgScore: stats.averageScore,
        neo4jEnabled: isNeo4jEnabled
      });

      return {
        matches: filteredMatches,
        total: filteredMatches.length,
        stats
      };
    } catch (error) {
      logger.error('❌ Error buscando matches:', { 
        error: error instanceof Error ? error.message : String(error),
        userId: userId.substring(0, 8) + '***'
      });
      return this.emptyResult();
    }
  }

  /**
   * Calcula compatibilidad entre dos usuarios específicos
   */
  async calculateCompatibility(
    userId1: string,
    userId2: string,
    context?: MatchingContext
  ): Promise<MatchScore | null> {
    try {
      const [user1, user2] = await Promise.all([
        this.getUserProfile(userId1),
        this.getUserProfile(userId2)
      ]);

      if (!user1 || !user2) {
        logger.warn('Uno o ambos perfiles no encontrados', { userId1, userId2 });
        return null;
      }

      return smartMatchingEngine.calculateCompatibility(user1, user2, context);
    } catch (error) {
      logger.error('Error calculando compatibilidad:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Obtiene perfil del usuario desde BD y lo convierte a UserProfile
   */
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .single();

      if (error || !profile) {
        logger.warn('Perfil no encontrado', { userId, error: error?.message });
        return null;
      }

      return this.mapToUserProfile(profile);
    } catch (error) {
      logger.error('Error obteniendo perfil de usuario:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Obtiene candidatos desde BD aplicando filtros
   */
  private async getCandidates(
    userId: string,
    options: MatchSearchOptions
  ): Promise<any[]> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', userId);

      // Aplicar filtros
      if (options.filters) {
        const { ageRange, gender, verifiedOnly, hasPhotos: _hasPhotos } = options.filters;

        if (ageRange) {
          query = query.gte('age', ageRange.min).lte('age', ageRange.max);
        }

        if (gender && gender.length > 0) {
          query = query.in('gender', gender);
        }

        if (verifiedOnly) {
          query = query.eq('is_verified', true);
        }

        // hasPhotos se verifica después obteniendo los datos
      }

      // Excluir ya matcheados
      if (options.excludeMatched) {
        if (!supabase) {
          logger.error('Supabase no está disponible');
          return [];
        }

        const { data: existingMatches } = await supabase
          .from('matches')
          .select('user1_id, user2_id')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        if (existingMatches && existingMatches.length > 0) {
          const matchedIds = existingMatches.flatMap(m => {
            if (m.user1_id === userId && m.user2_id) return [m.user2_id];
            if (m.user2_id === userId && m.user1_id) return [m.user1_id];
            return [];
          }).filter(Boolean);
          
          if (matchedIds.length > 0) {
            query = query.not('user_id', 'in', `(${matchedIds.map(id => `'${id}'`).join(',')})`);
          }
        }
      }

      // Aplicar límite y offset
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      query = query.limit(limit).range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        logger.error('Error obteniendo candidatos:', error);
        return [];
      }

      // Filtrar por fotos si se requiere
      if (options.filters?.hasPhotos && data) {
        // Verificar que tenga avatar_url (por ahora, ya que tabla images puede no existir)
        return data.filter((profile: any) => profile.avatar_url && profile.avatar_url.trim() !== '');
      }

      return data || [];
    } catch (error) {
      logger.error('Error obteniendo candidatos:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Mapea perfil de BD a UserProfile para el algoritmo
   */
  private mapToUserProfile(profile: any): UserProfile | null {
    try {
      // Parsear intereses (pueden estar en formato string JSON o array)
      let interests: string[] = [];
      if (profile.interests) {
        if (typeof profile.interests === 'string') {
          try {
            interests = JSON.parse(profile.interests);
          } catch {
            interests = profile.interests.split(',').map((i: string) => i.trim());
          }
        } else if (Array.isArray(profile.interests)) {
          interests = profile.interests;
        }
      }

      // Obtener intereses swinger si existen
      // TODO: Hacer query a user_swinger_interests si es necesario

      // Personalidad (valores por defecto si no existen)
      const personality = {
        openness: profile.openness || 50,
        conscientiousness: profile.conscientiousness || 50,
        extraversion: profile.extraversion || 50,
        agreeableness: profile.agreeableness || 50,
        neuroticism: profile.neuroticism || 50,
        adventurousness: profile.adventurousness || 50,
        discretion: profile.discretion || 50
      };

      // Preferencias (valores por defecto)
      const preferences = {
        ageRange: {
          min: profile.preferred_age_min || 18,
          max: profile.preferred_age_max || 65
        },
        genderPreference: profile.looking_for ? 
          (Array.isArray(profile.looking_for) ? profile.looking_for : [profile.looking_for]) :
          ['single', 'pareja'],
        maxDistance: profile.max_distance || 50,
        interests: interests,
        dealBreakers: profile.deal_breakers || [],
        importance: {
          personality: profile.importance_personality || 20,
          interests: profile.importance_interests || 25,
          location: profile.importance_location || 25,
          activity: profile.importance_activity || 15,
          verification: profile.importance_verification || 15
        }
      };

      // Actividad (calcular desde datos disponibles)
      const activity = {
        lastActive: profile.updated_at ? new Date(profile.updated_at) : new Date(),
        responseRate: profile.response_rate || 50,
        profileCompleteness: this.calculateCompleteness(profile),
        photosCount: profile.photos_count || 0,
        messagesExchanged: profile.messages_count || 0,
        meetingsArranged: profile.meetings_count || 0
      };

      // Verificación
      const verification = {
        isVerified: profile.is_verified || false,
        photoVerified: profile.photo_verified || false,
        phoneVerified: profile.phone_verified || false,
        idVerified: profile.id_verified || false,
        coupleVerified: profile.couple_verified || false
      };

      return {
        id: profile.user_id || profile.id,
        name: profile.first_name || profile.name || 'Usuario',
        age: profile.age || 25,
        gender: profile.profile_type === 'couple' ? 'pareja' : 'single',
        location: {
          city: profile.city || profile.location || 'Ciudad',
          coordinates: profile.latitude && profile.longitude ? {
            lat: profile.latitude,
            lng: profile.longitude
          } : undefined
        },
        interests,
        personality,
        preferences,
        activity,
        verification
      };
    } catch (error) {
      logger.error('Error mapeando perfil:', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Calcula completitud del perfil
   */
  private calculateCompleteness(profile: any): number {
    let completeness = 0;
    const fields = [
      'first_name', 'bio', 'age', 'gender', 'city',
      'interests', 'avatar_url', 'latitude', 'longitude'
    ];

    fields.forEach(field => {
      if (profile[field]) completeness += 100 / fields.length;
    });

    return Math.round(completeness);
  }

  /**
   * Enriquece matches con conexiones sociales desde Neo4j
   */
  private async enrichWithSocialConnections(
    userId: string,
    matches: MatchScore[],
    _options: MatchSearchOptions
  ): Promise<(MatchScore & { socialScore?: number; mutualFriends?: string[]; mutualFriendsCount?: number })[]> {
    // Verificar si Neo4j está habilitado
    const isNeo4jEnabled = typeof import.meta !== 'undefined' && import.meta.env 
      ? import.meta.env.VITE_NEO4J_ENABLED === 'true'
      : process.env.VITE_NEO4J_ENABLED === 'true';
    
    if (!isNeo4jEnabled) {
      logger.debug('Neo4j deshabilitado, saltando enriquecimiento social');
      return matches;
    }

    try {
      // Enriquecer cada match con conexiones sociales
      const enrichedMatches = await Promise.all(
        matches.map(async (match) => {
          try {
            // Obtener amigos mutuos desde Neo4j
            const mutualFriends = await neo4jService.getMutualFriends(userId, match.userId);
            
            // Calcular social score basado en conexiones
            // Bonus por amigos mutuos: 10 puntos por cada amigo mutuo (máximo 50 puntos)
            const socialScore = Math.min(mutualFriends.length * 10, 50);
            
            // Bonus adicional si hay muchos amigos mutuos (indicador de confianza)
            const trustBonus = mutualFriends.length >= 3 ? 20 : 0;
            const totalSocialScore = socialScore + trustBonus;

            logger.debug('Match enriquecido con conexiones sociales', {
              userId: userId.substring(0, 8) + '***',
              matchUserId: match.userId.substring(0, 8) + '***',
              mutualFriendsCount: mutualFriends.length,
              socialScore: totalSocialScore
            });

            return {
              ...match,
              socialScore: totalSocialScore,
              mutualFriends,
              mutualFriendsCount: mutualFriends.length
            };
          } catch (error) {
            // Si falla Neo4j, continuar sin enriquecimiento
            logger.warn('Error enriqueciendo match con Neo4j, continuando sin enriquecimiento', {
              userId: userId.substring(0, 8) + '***',
              matchUserId: match.userId.substring(0, 8) + '***',
              error: error instanceof Error ? error.message : String(error)
            });
            return match;
          }
        })
      );

      return enrichedMatches;
    } catch (error) {
      // Si falla completamente, retornar matches originales
      logger.error('Error enriqueciendo matches con Neo4j, retornando matches originales', {
        error: error instanceof Error ? error.message : String(error)
      });
      return matches;
    }
  }

  /**
   * Obtiene recomendaciones basadas en "friends of friends"
   */
  async getRecommendedUsers(
    userId: string,
    limit: number = 10,
    options: MatchSearchOptions = {}
  ): Promise<MatchSearchResult> {
    // Verificar si Neo4j está habilitado
    const isNeo4jEnabled = typeof import.meta !== 'undefined' && import.meta.env 
      ? import.meta.env.VITE_NEO4J_ENABLED === 'true'
      : process.env.VITE_NEO4J_ENABLED === 'true';
    
    if (!isNeo4jEnabled) {
      logger.debug('Neo4j deshabilitado, usando matching tradicional');
      return this.findMatches(userId, { ...options, limit });
    }

    try {
      logger.info('🔍 Obteniendo recomendaciones FOF para usuario', {
        userId: userId.substring(0, 8) + '***'
      });

      // 1. Obtener friends of friends desde Neo4j
      const fofRecommendations = await neo4jService.getFriendsOfFriends(
        userId,
        limit * 2, // Obtener más para filtrar después
        options.excludeMatched || true
      );

      if (fofRecommendations.length === 0) {
        logger.info('No hay recomendaciones FOF, usando matching tradicional');
        return this.findMatches(userId, { ...options, limit });
      }

      // 2. Obtener perfiles desde PostgreSQL
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return this.emptyResult();
      }

      const fofUserIds = fofRecommendations.map(f => f.userId);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', fofUserIds)
        .eq('is_public', true);

      if (error || !profiles || profiles.length === 0) {
        logger.warn('No se encontraron perfiles para recomendaciones FOF');
        return this.findMatches(userId, { ...options, limit });
      }

      // 3. Convertir a UserProfile y calcular matches
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        logger.warn('Perfil de usuario no encontrado');
        return this.emptyResult();
      }

      const userProfiles = profiles
        .map(p => this.mapToUserProfile(p))
        .filter(Boolean) as UserProfile[];

      const matches = smartMatchingEngine.findBestMatches(
        userProfile,
        userProfiles,
        limit,
        options.context
      );

      // 4. Enriquecer con información FOF
      const enrichedMatches = matches.map(match => {
        const fof = fofRecommendations.find(f => f.userId === match.userId);
        return {
          ...match,
          socialScore: (fof?.mutualCount || 0) * 15, // Bonus por conexiones FOF
          mutualFriendsCount: fof?.mutualCount || 0,
          isFOFRecommendation: true
        };
      });

      // 5. Filtrar por score mínimo
      const minScore = options.filters?.minScore || 30;
      const filteredMatches = enrichedMatches.filter(m => {
        const totalScore = m.totalScore + (m.socialScore || 0);
        return totalScore >= minScore;
      });

      // 6. Ordenar por score total
      filteredMatches.sort((a, b) => {
        const scoreA = a.totalScore + (a.socialScore || 0);
        const scoreB = b.totalScore + (b.socialScore || 0);
        return scoreB - scoreA;
      });

      // 7. Calcular estadísticas
      const stats = {
        totalCandidates: profiles.length,
        matchesFound: filteredMatches.length,
        averageScore: filteredMatches.length > 0
          ? Math.round(filteredMatches.reduce((sum, m) => sum + m.totalScore + (m.socialScore || 0), 0) / filteredMatches.length)
          : 0,
        highQualityMatches: filteredMatches.filter(m => m.totalScore + (m.socialScore || 0) >= 70).length
      };

      logger.info('✅ Recomendaciones FOF obtenidas', {
        userId: userId.substring(0, 8) + '***',
        total: filteredMatches.length,
        avgScore: stats.averageScore
      });

      return {
        matches: filteredMatches.slice(0, limit),
        total: filteredMatches.length,
        stats
      };
    } catch (error) {
      logger.error('❌ Error obteniendo recomendaciones FOF:', {
        error: error instanceof Error ? error.message : String(error),
        userId: userId.substring(0, 8) + '***'
      });
      // Fallback a matching tradicional
      return this.findMatches(userId, { ...options, limit });
    }
  }

  /**
   * Resultado vacío
   */
  private emptyResult(): MatchSearchResult {
    return {
      matches: [],
      total: 0,
      stats: {
        totalCandidates: 0,
        matchesFound: 0,
        averageScore: 0,
        highQualityMatches: 0
      }
    };
  }
}

// Exportar instancia singleton
export const smartMatchingService = SmartMatchingService.getInstance();

// Exportar también como clase para testing
export { SmartMatchingService };

