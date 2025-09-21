/**
 * Sistema de matching inteligente con IA para ComplicesConecta
 * Algoritmos avanzados de compatibilidad sin modificar lógica de negocio existente
 */

import { logger } from '@/lib/logger';

// Tipos para el sistema de matching
interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'single' | 'pareja';
  location: {
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  interests: string[];
  personality: PersonalityTraits;
  preferences: MatchingPreferences;
  activity: ActivityMetrics;
  verification: VerificationStatus;
}

interface PersonalityTraits {
  openness: number;        // 0-100: Apertura a experiencias
  conscientiousness: number; // 0-100: Responsabilidad
  extraversion: number;    // 0-100: Extroversión
  agreeableness: number;   // 0-100: Amabilidad
  neuroticism: number;     // 0-100: Neuroticismo (invertido = estabilidad)
  adventurousness: number; // 0-100: Específico para swingers
  discretion: number;      // 0-100: Nivel de discreción
}

interface MatchingPreferences {
  ageRange: { min: number; max: number };
  genderPreference: ('single' | 'pareja')[];
  maxDistance: number; // km
  interests: string[];
  dealBreakers: string[];
  importance: {
    personality: number;   // 0-100
    interests: number;     // 0-100
    location: number;      // 0-100
    activity: number;      // 0-100
    verification: number;  // 0-100
  };
}

interface ActivityMetrics {
  lastActive: Date;
  responseRate: number;    // 0-100
  profileCompleteness: number; // 0-100
  photosCount: number;
  messagesExchanged: number;
  meetingsArranged: number;
}

interface VerificationStatus {
  isVerified: boolean;
  photoVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  coupleVerified?: boolean; // Para parejas
}

interface MatchScore {
  userId: string;
  totalScore: number;      // 0-100
  breakdown: {
    personality: number;
    interests: number;
    location: number;
    activity: number;
    verification: number;
  };
  reasons: string[];
  redFlags: string[];
  confidence: number;      // 0-100
}

interface MatchingContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  userMood?: 'exploratory' | 'selective' | 'casual';
}

class SmartMatchingEngine {
  private readonly PERSONALITY_WEIGHTS = {
    openness: 0.25,
    conscientiousness: 0.15,
    extraversion: 0.20,
    agreeableness: 0.15,
    neuroticism: 0.10,
    adventurousness: 0.30, // Más importante para swingers
    discretion: 0.20
  };

  private readonly DISTANCE_DECAY_FACTOR = 0.1; // Decaimiento por distancia
  private readonly ACTIVITY_BOOST_FACTOR = 1.2;  // Boost por actividad reciente
  private readonly VERIFICATION_BONUS = 15;      // Bonus por verificación

  /**
   * Calcula compatibilidad entre dos usuarios
   */
  public calculateCompatibility(
    user1: UserProfile, 
    user2: UserProfile,
    context?: MatchingContext
  ): MatchScore {
    const breakdown = {
      personality: this.calculatePersonalityScore(user1, user2),
      interests: this.calculateInterestsScore(user1, user2),
      location: this.calculateLocationScore(user1, user2),
      activity: this.calculateActivityScore(user1, user2),
      verification: this.calculateVerificationScore(user1, user2)
    };

    // Aplicar pesos de preferencias del usuario
    const weights = user1.preferences.importance;
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    const normalizedWeights = {
      personality: weights.personality / totalWeight,
      interests: weights.interests / totalWeight,
      location: weights.location / totalWeight,
      activity: weights.activity / totalWeight,
      verification: weights.verification / totalWeight
    };

    // Calcular score ponderado
    const totalScore = Object.entries(breakdown).reduce((sum, [key, score]) => {
      return sum + (score * normalizedWeights[key as keyof typeof normalizedWeights]);
    }, 0);

    // Aplicar modificadores contextuales
    const contextModifier = this.getContextModifier(user1, user2, context);
    const finalScore = Math.min(100, totalScore * contextModifier);

    // Generar razones y red flags
    const reasons = this.generateMatchReasons(user1, user2, breakdown);
    const redFlags = this.detectRedFlags(user1, user2);
    
    // Calcular confianza basada en completitud de datos
    const confidence = this.calculateConfidence(user1, user2);

    const result: MatchScore = {
      userId: user2.id,
      totalScore: Math.round(finalScore),
      breakdown: {
        personality: Math.round(breakdown.personality),
        interests: Math.round(breakdown.interests),
        location: Math.round(breakdown.location),
        activity: Math.round(breakdown.activity),
        verification: Math.round(breakdown.verification)
      },
      reasons,
      redFlags,
      confidence: Math.round(confidence)
    };

    logger.info('🤖 Compatibilidad calculada', {
      user1: user1.id.substring(0, 8) + '***',
      user2: user2.id.substring(0, 8) + '***',
      score: result.totalScore,
      confidence: result.confidence
    });

    return result;
  }

  /**
   * Calcula score de personalidad usando Big Five + traits específicos
   */
  private calculatePersonalityScore(user1: UserProfile, user2: UserProfile): number {
    const traits1 = user1.personality;
    const traits2 = user2.personality;
    
    let totalScore = 0;
    let totalWeight = 0;

    // Calcular compatibilidad para cada trait
    for (const [trait, weight] of Object.entries(this.PERSONALITY_WEIGHTS)) {
      const value1 = traits1[trait as keyof PersonalityTraits];
      const value2 = traits2[trait as keyof PersonalityTraits];
      
      let compatibility: number;
      
      if (trait === 'adventurousness' || trait === 'openness') {
        // Para aventura y apertura, valores similares son mejores
        compatibility = 100 - Math.abs(value1 - value2);
      } else if (trait === 'discretion') {
        // Para discreción, ambos deben tener niveles altos
        compatibility = Math.min(value1, value2);
      } else if (trait === 'extraversion') {
        // Extroversión puede ser complementaria (no necesariamente igual)
        const diff = Math.abs(value1 - value2);
        compatibility = diff > 30 ? 70 + (30 - Math.min(30, diff)) : 100 - diff;
      } else {
        // Para otros traits, similitud es buena
        compatibility = 100 - Math.abs(value1 - value2);
      }
      
      totalScore += compatibility * weight;
      totalWeight += weight;
    }

    return totalScore / totalWeight;
  }

  /**
   * Calcula score de intereses compartidos
   */
  private calculateInterestsScore(user1: UserProfile, user2: UserProfile): number {
    const interests1 = new Set(user1.interests);
    const interests2 = new Set(user2.interests);
    
    const commonInterests = new Set([...interests1].filter(x => interests2.has(x)));
    const totalInterests = new Set([...interests1, ...interests2]);
    
    if (totalInterests.size === 0) return 50; // Neutral si no hay intereses
    
    // Jaccard similarity con boost por intereses específicos importantes
    const jaccardSimilarity = commonInterests.size / totalInterests.size;
    
    // Boost por intereses críticos para swingers
    const criticalInterests = ['discreción', 'respeto', 'comunicación', 'aventura'];
    const criticalMatches = criticalInterests.filter(interest => 
      interests1.has(interest) && interests2.has(interest)
    ).length;
    
    const criticalBonus = (criticalMatches / criticalInterests.length) * 20;
    
    return Math.min(100, (jaccardSimilarity * 80) + criticalBonus);
  }

  /**
   * Calcula score de proximidad geográfica
   */
  private calculateLocationScore(user1: UserProfile, user2: UserProfile): number {
    // Si están en la misma ciudad, score alto
    if (user1.location.city === user2.location.city) {
      return 95;
    }

    // Si tenemos coordenadas, calcular distancia real
    if (user1.location.coordinates && user2.location.coordinates) {
      const distance = this.calculateDistance(
        user1.location.coordinates,
        user2.location.coordinates
      );
      
      const maxDistance = user1.preferences.maxDistance;
      
      if (distance > maxDistance) {
        return 0; // Fuera del rango preferido
      }
      
      // Score decae exponencialmente con la distancia
      return Math.max(0, 100 - (distance * this.DISTANCE_DECAY_FACTOR));
    }

    // Fallback: score moderado si no tenemos coordenadas exactas
    return 60;
  }

  /**
   * Calcula score de actividad y engagement
   */
  private calculateActivityScore(user1: UserProfile, user2: UserProfile): number {
    const activity2 = user2.activity;
    
    // Factores de actividad
    const recentActivity = this.getRecentActivityScore(activity2.lastActive);
    const responseRate = activity2.responseRate;
    const profileCompleteness = activity2.profileCompleteness;
    const engagement = Math.min(100, 
      (activity2.messagesExchanged * 2) + 
      (activity2.meetingsArranged * 10)
    );
    
    // Promedio ponderado
    const score = (
      recentActivity * 0.3 +
      responseRate * 0.3 +
      profileCompleteness * 0.25 +
      engagement * 0.15
    );
    
    return score;
  }

  /**
   * Calcula score de verificación y confiabilidad
   */
  private calculateVerificationScore(user1: UserProfile, user2: UserProfile): number {
    const verification = user2.verification;
    let score = 0;
    
    if (verification.isVerified) score += 25;
    if (verification.photoVerified) score += 25;
    if (verification.phoneVerified) score += 20;
    if (verification.idVerified) score += 20;
    if (verification.coupleVerified && user2.gender === 'pareja') score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Calcula distancia entre coordenadas (fórmula de Haversine)
   */
  private calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calcula score de actividad reciente
   */
  private getRecentActivityScore(lastActive: Date): number {
    const now = new Date();
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceActive < 1) return 100;
    if (hoursSinceActive < 24) return 90;
    if (hoursSinceActive < 72) return 70;
    if (hoursSinceActive < 168) return 50; // 1 semana
    if (hoursSinceActive < 720) return 30; // 1 mes
    
    return 10; // Muy inactivo
  }

  /**
   * Aplica modificadores contextuales
   */
  private getContextModifier(
    user1: UserProfile, 
    user2: UserProfile, 
    context?: MatchingContext
  ): number {
    if (!context) return 1.0;
    
    let modifier = 1.0;
    
    // Modificador por tiempo del día
    if (context.timeOfDay === 'evening' || context.timeOfDay === 'night') {
      modifier *= 1.1; // Más actividad en horarios nocturnos
    }
    
    // Modificador por día de la semana
    if (context.dayOfWeek === 'weekend') {
      modifier *= 1.15; // Más actividad en fines de semana
    }
    
    // Modificador por humor del usuario
    if (context.userMood === 'exploratory') {
      modifier *= 1.2; // Boost cuando el usuario está explorando
    } else if (context.userMood === 'selective') {
      modifier *= 0.9; // Más estricto cuando es selectivo
    }
    
    return modifier;
  }

  /**
   * Genera razones del match
   */
  private generateMatchReasons(
    user1: UserProfile, 
    user2: UserProfile, 
    breakdown: MatchScore['breakdown']
  ): string[] {
    const reasons: string[] = [];
    
    // Razones por personalidad
    if (breakdown.personality > 80) {
      reasons.push('Personalidades muy compatibles');
    } else if (breakdown.personality > 60) {
      reasons.push('Buena compatibilidad de personalidad');
    }
    
    // Razones por intereses
    const commonInterests = user1.interests.filter(i => user2.interests.includes(i));
    if (commonInterests.length > 3) {
      reasons.push(`Comparten ${commonInterests.length} intereses`);
    } else if (commonInterests.length > 0) {
      reasons.push(`Intereses en común: ${commonInterests.slice(0, 2).join(', ')}`);
    }
    
    // Razones por ubicación
    if (breakdown.location > 90) {
      reasons.push('Muy cerca geográficamente');
    } else if (breakdown.location > 70) {
      reasons.push('Ubicación conveniente');
    }
    
    // Razones por actividad
    if (breakdown.activity > 80) {
      reasons.push('Usuario muy activo y responsivo');
    }
    
    // Razones por verificación
    if (breakdown.verification > 80) {
      reasons.push('Perfil completamente verificado');
    }
    
    return reasons;
  }

  /**
   * Detecta red flags potenciales
   */
  private detectRedFlags(user1: UserProfile, user2: UserProfile): string[] {
    const redFlags: string[] = [];
    
    // Red flags por actividad
    if (user2.activity.responseRate < 30) {
      redFlags.push('Baja tasa de respuesta');
    }
    
    const daysSinceActive = (Date.now() - user2.activity.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive > 30) {
      redFlags.push('Inactivo por más de un mes');
    }
    
    // Red flags por perfil
    if (user2.activity.profileCompleteness < 50) {
      redFlags.push('Perfil incompleto');
    }
    
    if (user2.activity.photosCount < 2) {
      redFlags.push('Pocas fotos en el perfil');
    }
    
    // Red flags por verificación
    if (!user2.verification.photoVerified) {
      redFlags.push('Fotos no verificadas');
    }
    
    // Red flags por incompatibilidad de preferencias
    if (!user1.preferences.genderPreference.includes(user2.gender)) {
      redFlags.push('No coincide con preferencias de género');
    }
    
    const age = user2.age;
    if (age < user1.preferences.ageRange.min || age > user1.preferences.ageRange.max) {
      redFlags.push('Fuera del rango de edad preferido');
    }
    
    return redFlags;
  }

  /**
   * Calcula confianza en el match basada en completitud de datos
   */
  private calculateConfidence(user1: UserProfile, user2: UserProfile): number {
    let confidence = 0;
    
    // Factores que aumentan confianza
    if (user2.activity.profileCompleteness > 80) confidence += 25;
    if (user2.activity.photosCount >= 3) confidence += 20;
    if (user2.verification.isVerified) confidence += 20;
    if (user2.interests.length >= 5) confidence += 15;
    if (user2.location.coordinates) confidence += 10;
    if (user2.activity.messagesExchanged > 10) confidence += 10;
    
    return Math.min(100, confidence);
  }

  /**
   * Encuentra los mejores matches para un usuario
   */
  public findBestMatches(
    user: UserProfile,
    candidates: UserProfile[],
    limit: number = 20,
    context?: MatchingContext
  ): MatchScore[] {
    const matches = candidates
      .filter(candidate => {
        // Filtros básicos
        if (candidate.id === user.id) return false;
        
        // Verificar preferencias de género
        if (!user.preferences.genderPreference.includes(candidate.gender)) {
          return false;
        }
        
        // Verificar rango de edad
        const age = candidate.age;
        if (age < user.preferences.ageRange.min || age > user.preferences.ageRange.max) {
          return false;
        }
        
        // Verificar deal breakers
        const hasDealbBreaker = user.preferences.dealBreakers.some(dealBreaker =>
          candidate.interests.includes(dealBreaker)
        );
        if (hasDealbBreaker) return false;
        
        return true;
      })
      .map(candidate => this.calculateCompatibility(user, candidate, context))
      .filter(match => match.totalScore >= 30) // Score mínimo
      .sort((a, b) => {
        // Ordenar por score, luego por confianza
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, limit);

    logger.info('🎯 Mejores matches encontrados', {
      userId: user.id.substring(0, 8) + '***',
      totalCandidates: candidates.length,
      matchesFound: matches.length,
      averageScore: matches.length > 0 ? 
        Math.round(matches.reduce((sum, m) => sum + m.totalScore, 0) / matches.length) : 0
    });

    return matches;
  }
}

// Instancia singleton del motor de matching
const smartMatchingEngine = new SmartMatchingEngine();

// Hook para usar matching inteligente en componentes React
export const useSmartMatching = () => {
  const findMatches = (
    user: UserProfile,
    candidates: UserProfile[],
    options?: {
      limit?: number;
      context?: MatchingContext;
      minScore?: number;
    }
  ) => {
    const { limit = 20, context, minScore = 30 } = options || {};
    
    const matches = smartMatchingEngine.findBestMatches(user, candidates, limit, context);
    
    return {
      matches: matches.filter(m => m.totalScore >= minScore),
      stats: {
        totalCandidates: candidates.length,
        matchesFound: matches.length,
        averageScore: matches.length > 0 ? 
          Math.round(matches.reduce((sum, m) => sum + m.totalScore, 0) / matches.length) : 0,
        highQualityMatches: matches.filter(m => m.totalScore >= 70).length
      }
    };
  };

  const calculateCompatibility = (
    user1: UserProfile,
    user2: UserProfile,
    context?: MatchingContext
  ) => {
    return smartMatchingEngine.calculateCompatibility(user1, user2, context);
  };

  return { findMatches, calculateCompatibility };
};

export { 
  smartMatchingEngine,
  type UserProfile,
  type PersonalityTraits,
  type MatchingPreferences,
  type ActivityMetrics,
  type VerificationStatus,
  type MatchScore,
  type MatchingContext
};

export default SmartMatchingEngine;
