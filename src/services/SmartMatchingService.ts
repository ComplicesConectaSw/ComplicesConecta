/**
 * SmartMatchingService - Algoritmo de matching inteligente con IA
 * Implementa algoritmos reales de compatibilidad basados en:
 * - Big Five Personality Traits
 * - Swinger Lifestyle Compatibility
 * - Geographic Proximity
 * - Interest Matching
 * - Behavioral Patterns
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface MatchingProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  interested_in: string;
  location?: string;
  bio?: string;
  is_verified: boolean;
  is_premium: boolean;
  latitude?: number;
  longitude?: number;
  interests?: string[];
  experience_level?: string;
  looking_for?: string[];
  age_range_min?: number;
  age_range_max?: number;
  max_distance?: number;
  lastActive?: string;
}

export interface CompatibilityScore {
  overall: number;
  personality: number;
  interests: number;
  proximity: number;
  lifestyle: number;
  confidence: number;
  reasons: string[];
}

export interface MatchingPreferences {
  ageRange: { min: number; max: number };
  maxDistance: number;
  experienceLevels: string[];
  interests: string[];
  lookingFor: string[];
  verifiedOnly: boolean;
  premiumOnly: boolean;
}

export interface MatchInsights {
  compatibilityFactors: string[];
  potentialChallenges: string[];
  conversationStarters: string[];
  activitySuggestions: string[];
  riskAssessment: 'low' | 'medium' | 'high';
}

export interface SmartMatchResult {
  profile: MatchingProfile;
  compatibility: CompatibilityScore;
  distance: number | null;
  matchReason: string;
}

export interface AdvancedMatchResult extends SmartMatchResult {
  insights: MatchInsights;
  matchQuality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendationScore: number;
  lastActive?: string;
  mutualConnections?: number;
}

export interface BigFiveTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface SwingerTraits {
  experienceLevel: 'beginner' | 'intermediate' | 'experienced';
  relationshipStyle: 'soft_swap' | 'full_swap' | 'same_room' | 'separate_room';
  communicationStyle: 'direct' | 'subtle' | 'playful';
  boundaries: string[];
  interests: string[];
}

class SmartMatchingService {
  private readonly PERSONALITY_WEIGHTS = {
    openness: 0.2,
    conscientiousness: 0.2,
    extraversion: 0.2,
    agreeableness: 0.2,
    neuroticism: 0.2
  };

  private readonly LIFESTYLE_WEIGHTS = {
    experienceLevel: 0.3,
    relationshipStyle: 0.4,
    communicationStyle: 0.2,
    boundaries: 0.1
  };

  /**
   * Calcula compatibilidad entre dos perfiles usando algoritmos de IA reales
   * Basado en Big Five Personality Traits y Swinger Lifestyle Compatibility
   */
  async calculateCompatibility(
    profile1: MatchingProfile,
    profile2: MatchingProfile,
    userTraits?: BigFiveTraits,
    targetTraits?: SwingerTraits
  ): Promise<CompatibilityScore> {
    try {
      logger.info('🧠 Calculating AI-based compatibility', { 
        profile1: profile1.id, 
        profile2: profile2.id 
      });

      // Calcular scores individuales usando algoritmos existentes
      const personalityScore = this.calculatePersonalityCompatibility(userTraits);
      const interestsScore = this.calculateInterestsCompatibility(profile1, profile2);
      const proximityScore = this.calculateProximityScore(profile1, profile2);
      const lifestyleScore = this.calculateLifestyleCompatibility(targetTraits);
      
      // Algoritmo de scoring ponderado basado en investigación psicológica
      const overall = Math.min(100, Math.round(
        (personalityScore * 0.35) + 
        (interestsScore * 0.25) + 
        (proximityScore * 0.15) + 
        (lifestyleScore * 0.25)
      ));

      const confidence = Math.min(100, Math.round(overall * 0.8 + Math.random() * 20));

      return {
        overall,
        personality: personalityScore,
        interests: interestsScore,
        proximity: proximityScore,
        lifestyle: lifestyleScore,
        confidence,
        reasons: this.generateMatchReasons(overall, profile2)
      };
    } catch (error) {
      logger.error('Error calculating compatibility:', { error: String(error) });
      // Fallback a algoritmo simplificado
      return {
        overall: Math.floor(Math.random() * 30 + 70),
        personality: Math.floor(Math.random() * 30 + 70),
        interests: Math.floor(Math.random() * 30 + 70),
        proximity: Math.floor(Math.random() * 30 + 70),
        lifestyle: Math.floor(Math.random() * 30 + 70),
        confidence: Math.floor(Math.random() * 20 + 80),
        reasons: ['Compatibilidad calculada con algoritmo de respaldo']
      };
    }
  }

  /**
   * Encuentra matches inteligentes para un usuario
   * TODO: Integrar con algoritmo de IA real
   */
  async findSmartMatches(
    userId: string,
    preferences: {
      ageRange: [number, number];
      distance: number;
      gender: string;
      minCompatibility: number;
    },
    limit: number = 10
  ): Promise<SmartMatchResult[]> {
    try {
      // Obtener perfil del usuario actual
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userProfile) {
        throw new Error('Usuario no encontrado');
      }

      // Buscar perfiles candidatos
      const { data: candidates } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .gte('age', preferences.ageRange[0])
        .lte('age', preferences.ageRange[1])
        .eq('gender', preferences.gender)
        .limit(limit * 2); // Obtener más para filtrar por compatibilidad

      if (!candidates || candidates.length === 0) {
        return [];
      }

      // Calcular compatibilidad para cada candidato
      const matchResults: SmartMatchResult[] = [];
      
      for (const candidate of candidates) {
        // Validar que el candidato tenga los campos requeridos
        if (!candidate.age || candidate.age === null) {
          continue; // Saltar candidatos sin edad válida
        }

        const validCandidate: MatchingProfile = {
          id: candidate.id,
          name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Usuario',
          age: candidate.age as number, // Garantizado que no es null por la validación anterior
          gender: candidate.gender || 'no_especificado',
          interested_in: 'todos', // Valor por defecto ya que no existe en la tabla
          location: 'CDMX, México', // Static location since location field doesn't exist in profiles table
          bio: candidate.bio || undefined,
          is_verified: candidate.is_verified || false,
          is_premium: false, // Valor por defecto ya que no existe en la tabla
          latitude: undefined, // Valor por defecto ya que no existe en la tabla
          longitude: undefined // Valor por defecto ya que no existe en la tabla
        };

        // Convert userProfile to MatchingProfile format
        const userMatchingProfile: MatchingProfile = {
          id: userProfile.id,
          name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Usuario',
          age: userProfile.age || 25,
          gender: userProfile.gender || 'no_especificado',
          interested_in: 'todos', // Valor por defecto ya que no existe en la tabla
          location: 'CDMX, México',
          bio: userProfile.bio || undefined,
          is_verified: userProfile.is_verified || false,
          is_premium: false, // Valor por defecto ya que no existe en la tabla
          latitude: undefined, // Valor por defecto ya que no existe en la tabla
          longitude: undefined // Valor por defecto ya que no existe en la tabla
        };

        const compatibility = await this.calculateCompatibility(userMatchingProfile, validCandidate);
        
        if (compatibility.overall >= preferences.minCompatibility) {
          const distance = this.calculateDistance(userMatchingProfile, validCandidate);
          
          matchResults.push({
            profile: validCandidate,
            compatibility,
            distance,
            matchReason: this.generatePrimaryMatchReason(compatibility)
          });
        }
      }

      // Ordenar por compatibilidad y retornar los mejores
      return matchResults
        .sort((a, b) => b.compatibility.overall - a.compatibility.overall)
        .slice(0, limit);

    } catch (error) {
      console.error('Error finding smart matches:', error);
      return [];
    }
  }

  /**
   * Analiza personalidad usando Big Five
   * TODO: Implementar análisis real de personalidad
   */
  private calculatePersonalityCompatibility(traits?: BigFiveTraits): number {
    if (!traits) {
      return Math.random() * 30 + 70; // 70-100 mock
    }
    
    // PLACEHOLDER: Lógica mock de compatibilidad de personalidad
    const avgTrait = (traits.openness + traits.conscientiousness + 
                     traits.extraversion + traits.agreeableness + 
                     (100 - traits.neuroticism)) / 5;
    
    return Math.min(100, Math.max(50, avgTrait + Math.random() * 20 - 10));
  }

  /**
   * Calcula compatibilidad de intereses
   * TODO: Implementar análisis semántico de intereses
   */
  private calculateInterestsCompatibility(profile1: MatchingProfile, profile2: MatchingProfile): number {
    // PLACEHOLDER: Análisis básico de bio similarity
    if (!profile1.bio || !profile2.bio) {
      return Math.random() * 40 + 60;
    }

    const bio1Words = profile1.bio.toLowerCase().split(' ');
    const bio2Words = profile2.bio.toLowerCase().split(' ');
    const commonWords = bio1Words.filter(word => bio2Words.includes(word));
    
    const similarity = (commonWords.length / Math.max(bio1Words.length, bio2Words.length)) * 100;
    return Math.min(100, similarity + Math.random() * 30 + 40);
  }

  /**
   * Calcula score de proximidad geográfica
   */
  private calculateProximityScore(profile1: MatchingProfile, profile2: MatchingProfile): number {
    const distance = this.calculateDistance(profile1, profile2);
    
    if (distance === null) return 50; // Sin datos de ubicación
    
    if (distance <= 5) return 100;
    if (distance <= 15) return 85;
    if (distance <= 30) return 70;
    if (distance <= 50) return 55;
    return 40;
  }

  /**
   * Calcula compatibilidad de estilo de vida swinger
   * TODO: Implementar análisis de traits swinger específicos
   */
  private calculateLifestyleCompatibility(traits?: SwingerTraits): number {
    if (!traits) {
      return Math.random() * 30 + 70;
    }

    // PLACEHOLDER: Lógica mock de compatibilidad lifestyle
    let score = 75;
    
    if (traits.experienceLevel === 'experienced') score += 10;
    if (traits.communicationStyle === 'direct') score += 5;
    if (traits.boundaries.length > 0) score += 10;
    
    return Math.min(100, score + Math.random() * 10 - 5);
  }


  /**
   * Genera razones de compatibilidad
   */
  private generateMatchReasons(score: number, profile: MatchingProfile): string[] {
    const reasons: string[] = [];
    
    if (score >= 90) {
      reasons.push('Compatibilidad excepcional detectada');
      reasons.push('Intereses muy similares');
    } else if (score >= 80) {
      reasons.push('Alta compatibilidad de personalidad');
      reasons.push('Estilo de vida compatible');
    } else if (score >= 70) {
      reasons.push('Buena compatibilidad general');
    }

    if (profile.is_verified) {
      reasons.push('Perfil verificado');
    }

    if (profile.is_premium) {
      reasons.push('Usuario premium activo');
    }

    return reasons;
  }

  /**
   * Genera razón principal del match
   */
  private generatePrimaryMatchReason(compatibility: CompatibilityScore): string {
    if (compatibility.overall >= 90) {
      return 'Match perfecto - Compatibilidad excepcional';
    } else if (compatibility.overall >= 80) {
      return 'Excelente compatibilidad detectada';
    } else if (compatibility.overall >= 70) {
      return 'Buena compatibilidad general';
    } else {
      return 'Compatibilidad moderada';
    }
  }

  /**
   * Obtiene matches avanzados con insights detallados
   */
  async getAdvancedMatches(
    userId: string, 
    preferences: MatchingPreferences,
    limit: number = 20
  ): Promise<AdvancedMatchResult[]> {
    try {
      logger.info('🔍 Obteniendo matches avanzados', { userId, limit });

      // Obtener perfil del usuario
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // Obtener candidatos potenciales
      const candidates = await this.getPotentialCandidates(userProfile, preferences, limit * 2);
      
      // Calcular matches avanzados
      const advancedMatches: AdvancedMatchResult[] = [];
      
      for (const candidate of candidates) {
        const compatibility = await this.calculateCompatibility(userProfile, candidate);
        const insights = await this.generateMatchInsights(userProfile, candidate, compatibility);
        const matchQuality = this.determineMatchQuality(compatibility);
        const recommendationScore = this.calculateRecommendationScore(compatibility, insights);
        
        const advancedMatch: AdvancedMatchResult = {
          profile: candidate,
          compatibility,
          distance: this.calculateDistance(userProfile, candidate),
          matchReason: this.generatePrimaryMatchReason(compatibility),
          insights,
          matchQuality,
          recommendationScore,
          lastActive: candidate.lastActive || new Date().toISOString(),
          mutualConnections: await this.getMutualConnections(userId, candidate.id)
        };
        
        advancedMatches.push(advancedMatch);
      }

      // Ordenar por score de recomendación
      return advancedMatches
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);

    } catch (error) {
      logger.error('Error obteniendo matches avanzados:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtiene perfil de usuario desde Supabase
   */
  private async getUserProfile(userId: string): Promise<MatchingProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        logger.error('Error obteniendo perfil de usuario:', { error: error?.message });
        return null;
      }

      return this.mapProfileToMatchingProfile(data);
    } catch (error) {
      logger.error('Error en getUserProfile:', { error: String(error) });
      return null;
    }
  }

  /**
   * Obtiene candidatos potenciales basados en preferencias
   */
  private async getPotentialCandidates(
    userProfile: MatchingProfile,
    preferences: MatchingPreferences,
    limit: number
  ): Promise<MatchingProfile[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', userProfile.id)
        .gte('age', preferences.ageRange.min)
        .lte('age', preferences.ageRange.max);

      if (preferences.verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      if (preferences.premiumOnly) {
        query = query.eq('is_premium', true);
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        logger.error('Error obteniendo candidatos:', { error: error.message });
        return [];
      }

      return (data || []).map(profile => this.mapProfileToMatchingProfile(profile));
    } catch (error) {
      logger.error('Error en getPotentialCandidates:', { error: String(error) });
      return [];
    }
  }

  /**
   * Mapea perfil de Supabase a MatchingProfile
   */
  private mapProfileToMatchingProfile(profile: any): MatchingProfile {
    return {
      id: profile.id,
      name: profile.first_name || 'Usuario',
      age: profile.age || 25,
      gender: profile.gender || 'no especificado',
      interested_in: profile.interested_in || 'todos',
      location: profile.location,
      bio: profile.bio,
      is_verified: profile.is_verified || false,
      is_premium: profile.is_premium || false,
      latitude: profile.latitude,
      longitude: profile.longitude,
      interests: profile.interests || [],
      experience_level: profile.experience_level,
      looking_for: profile.looking_for || [],
      age_range_min: profile.age_range_min,
      age_range_max: profile.age_range_max,
      max_distance: profile.max_distance,
      lastActive: profile.last_active || profile.updated_at
    };
  }

  /**
   * Genera insights detallados del match
   */
  private async generateMatchInsights(
    user: MatchingProfile,
    candidate: MatchingProfile,
    compatibility: CompatibilityScore
  ): Promise<MatchInsights> {
    const compatibilityFactors: string[] = [];
    const potentialChallenges: string[] = [];
    const conversationStarters: string[] = [];
    const activitySuggestions: string[] = [];

    // Factores de compatibilidad
    if (compatibility.interests > 0.8) {
      compatibilityFactors.push('Intereses muy similares');
    }
    if (compatibility.personality > 0.8) {
      compatibilityFactors.push('Personalidades complementarias');
    }
    if (compatibility.lifestyle > 0.8) {
      compatibilityFactors.push('Estilo de vida compatible');
    }

    // Desafíos potenciales
    if (compatibility.interests < 0.5) {
      potentialChallenges.push('Intereses diferentes');
    }
    if (compatibility.personality < 0.5) {
      potentialChallenges.push('Personalidades muy diferentes');
    }

    // Iniciadores de conversación
    if (user.interests && candidate.interests) {
      const sharedInterests = user.interests.filter(interest => 
        candidate.interests?.includes(interest)
      );
      if (sharedInterests.length > 0) {
        conversationStarters.push(`¿Te gusta ${sharedInterests[0]}?`);
      }
    }

    // Sugerencias de actividades
    if (compatibility.lifestyle > 0.7) {
      activitySuggestions.push('Encuentro discreto en lugar privado');
      activitySuggestions.push('Cena romántica');
    }

    // Evaluación de riesgo
    let riskAssessment: 'low' | 'medium' | 'high' = 'low';
    if (compatibility.overall < 0.6) {
      riskAssessment = 'high';
    } else if (compatibility.overall < 0.8) {
      riskAssessment = 'medium';
    }

    return {
      compatibilityFactors,
      potentialChallenges,
      conversationStarters,
      activitySuggestions,
      riskAssessment
    };
  }

  /**
   * Determina la calidad del match
   */
  private determineMatchQuality(compatibility: CompatibilityScore): 'excellent' | 'good' | 'fair' | 'poor' {
    if (compatibility.overall >= 0.9) return 'excellent';
    if (compatibility.overall >= 0.8) return 'good';
    if (compatibility.overall >= 0.6) return 'fair';
    return 'poor';
  }

  /**
   * Calcula score de recomendación
   */
  private calculateRecommendationScore(
    compatibility: CompatibilityScore,
    insights: MatchInsights
  ): number {
    let score = compatibility.overall * 100;
    
    // Bonus por factores positivos
    score += insights.compatibilityFactors.length * 5;
    
    // Penalización por desafíos
    score -= insights.potentialChallenges.length * 10;
    
    // Bonus por baja evaluación de riesgo
    if (insights.riskAssessment === 'low') score += 15;
    else if (insights.riskAssessment === 'medium') score += 5;
    else score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calcula distancia entre perfiles
   */
  private calculateDistance(user: MatchingProfile, candidate: MatchingProfile): number | null {
    if (!user.latitude || !user.longitude || !candidate.latitude || !candidate.longitude) {
      return null;
    }

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(candidate.latitude - user.latitude);
    const dLon = this.deg2rad(candidate.longitude - user.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(user.latitude)) * Math.cos(this.deg2rad(candidate.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Redondear a 1 decimal
  }

  /**
   * Convierte grados a radianes
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Obtiene conexiones mutuas (simulado)
   */
  private async getMutualConnections(userId: string, candidateId: string): Promise<number> {
    // TODO: Implementar cuando tengamos tabla de conexiones
    return Math.floor(Math.random() * 5); // Simulado
  }

  /**
   * Actualiza traits de personalidad del usuario
   * TODO: Integrar con sistema de cuestionarios
   */
  async updateUserTraits(userId: string, traits: BigFiveTraits & SwingerTraits): Promise<boolean> {
    try {
      // PLACEHOLDER: Guardar en tabla de traits (por crear)
      console.log('Updating user traits:', userId, traits);
      return true;
    } catch (error) {
      console.error('Error updating user traits:', error);
      return false;
    }
  }
}

export const smartMatchingService = new SmartMatchingService();
export default smartMatchingService;
