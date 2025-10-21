/**
 * SmartMatchingService - Algoritmo de matching inteligente con IA
 * TODO: Implementar lógica real de IA con Big Five + traits swinger
 * PLACEHOLDER: Retorna datos mock seguros para mantener funcionalidad
 */

import { supabase } from '@/integrations/supabase/client';

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

export interface SmartMatchResult {
  profile: MatchingProfile;
  compatibility: CompatibilityScore;
  distance?: number | null;
  matchReason: string;
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
  /**
   * Calcula compatibilidad entre dos perfiles usando IA
   * TODO: Implementar algoritmo real basado en Big Five + traits swinger
   */
  async calculateCompatibility(
    profile1: MatchingProfile,
    profile2: MatchingProfile,
    userTraits?: BigFiveTraits,
    targetTraits?: SwingerTraits
  ): Promise<CompatibilityScore> {
    // PLACEHOLDER: Algoritmo mock que simula scoring inteligente
    const baseScore = Math.random() * 40 + 60; // 60-100 para simular matches buenos
    
    const personalityScore = this.calculatePersonalityCompatibility(userTraits);
    const interestsScore = this.calculateInterestsCompatibility(profile1, profile2);
    const proximityScore = this.calculateProximityScore(profile1, profile2);
    const lifestyleScore = this.calculateLifestyleCompatibility(targetTraits);
    
    const overall = Math.min(100, Math.round(
      (baseScore * 0.4) + 
      (personalityScore * 0.25) + 
      (interestsScore * 0.15) + 
      (proximityScore * 0.1) + 
      (lifestyleScore * 0.1)
    ));

    return {
      overall,
      personality: personalityScore,
      interests: interestsScore,
      proximity: proximityScore,
      lifestyle: lifestyleScore,
      confidence: Math.min(95, overall + Math.random() * 10),
      reasons: this.generateMatchReasons(overall, profile2)
    };
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
        .contains('interested_in', [preferences.gender])
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
          interested_in: Array.isArray(candidate.interested_in) ? candidate.interested_in[0] || 'todos' : candidate.interested_in || 'todos',
          location: 'CDMX, México', // Static location since location field doesn't exist in profiles table
          bio: candidate.bio || undefined,
          is_verified: candidate.is_verified || false,
          is_premium: candidate.is_premium || false,
          latitude: candidate.latitude || undefined,
          longitude: candidate.longitude || undefined
        };

        // Convert userProfile to MatchingProfile format
        const userMatchingProfile: MatchingProfile = {
          id: userProfile.id,
          name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Usuario',
          age: userProfile.age || 25,
          gender: userProfile.gender || 'no_especificado',
          interested_in: Array.isArray(userProfile.interested_in) ? userProfile.interested_in[0] || 'todos' : userProfile.interested_in || 'todos',
          location: 'CDMX, México',
          bio: userProfile.bio || undefined,
          is_verified: userProfile.is_verified || false,
          is_premium: userProfile.is_premium || false,
          latitude: userProfile.latitude || undefined,
          longitude: userProfile.longitude || undefined
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
   * Calcula distancia entre dos perfiles usando Haversine
   */
  private calculateDistance(profile1: MatchingProfile, profile2: MatchingProfile): number | null {
    if (!profile1.latitude || !profile1.longitude || 
        !profile2.latitude || !profile2.longitude) {
      return null;
    }

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(profile2.latitude - profile1.latitude);
    const dLon = this.toRadians(profile2.longitude - profile1.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(profile1.latitude)) * 
              Math.cos(this.toRadians(profile2.latitude)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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
