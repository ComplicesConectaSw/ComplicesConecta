import { logger } from '@/lib/logger';
import { redisCache, CacheKeys, CacheTTL } from '@/lib/redis-cache';
import { analyticsMetrics, trackInteraction } from '@/lib/analytics-metrics';

/**
 * Sistema de Matching Optimizado con Machine Learning
 * Algoritmo inteligente que aprende de las interacciones de usuarios
 */

interface UserProfile {
  id: string;
  age: number;
  interests: string[];
  location: { lat: number; lng: number };
  preferences: {
    ageRange: [number, number];
    maxDistance: number;
    interests: string[];
  };
  behaviorData: UserBehavior;
}

interface UserBehavior {
  likedProfiles: string[];
  passedProfiles: string[];
  matchedProfiles: string[];
  messagesSent: number;
  messagesReceived: number;
  profileViews: number;
  responseRate: number;
  averageConversationLength: number;
  preferredInteractionTimes: number[]; // Horas del día
  sessionDuration: number;
}

interface MLMatchScore {
  profileId: string;
  compatibilityScore: number;
  mlScore: number;
  factors: {
    interests: number;
    behavior: number;
    location: number;
    preferences: number;
    timing: number;
    socialProof: number;
  };
  confidence: number;
  reasoning: string[];
}

interface MLModel {
  weights: {
    interests: number;
    behavior: number;
    location: number;
    preferences: number;
    timing: number;
    socialProof: number;
  };
  learningRate: number;
  trainingData: TrainingExample[];
}

interface TrainingExample {
  userProfile: UserProfile;
  candidateProfile: UserProfile;
  outcome: 'like' | 'pass' | 'match' | 'conversation' | 'long_conversation';
  timestamp: number;
}

class MLMatchingEngine {
  private model: MLModel;
  private trainingExamples: TrainingExample[] = [];
  private isTraining = false;

  constructor() {
    this.model = this.initializeModel();
    this.loadModelFromCache();
    console.log('🤖 ML Matching Engine inicializado - Algoritmo inteligente activo');
  }

  private initializeModel(): MLModel {
    return {
      weights: {
        interests: 0.25,
        behavior: 0.20,
        location: 0.15,
        preferences: 0.15,
        timing: 0.10,
        socialProof: 0.15
      },
      learningRate: 0.01,
      trainingData: []
    };
  }

  // Calcular score ML mejorado
  async calculateMLScore(userProfile: UserProfile, candidateProfile: UserProfile): Promise<MLMatchScore> {
    console.log(`🤖 ML Matching: Calculando score para ${userProfile.id} -> ${candidateProfile.id}`);

    const factors = {
      interests: this.calculateInterestCompatibility(userProfile, candidateProfile),
      behavior: this.calculateBehaviorCompatibility(userProfile, candidateProfile),
      location: this.calculateLocationCompatibility(userProfile, candidateProfile),
      preferences: this.calculatePreferenceCompatibility(userProfile, candidateProfile),
      timing: this.calculateTimingCompatibility(userProfile, candidateProfile),
      socialProof: this.calculateSocialProofScore(candidateProfile)
    };

    // Aplicar pesos del modelo ML
    const mlScore = Object.entries(factors).reduce((total, [key, value]) => {
      const weight = this.model.weights[key as keyof typeof this.model.weights];
      return total + (value * weight);
    }, 0);

    // Calcular compatibilidad base
    const baseCompatibility = this.calculateBaseCompatibility(userProfile, candidateProfile);
    
    // Score final combinado (70% ML, 30% base)
    const finalScore = (mlScore * 0.7) + (baseCompatibility * 0.3);

    // Calcular confianza basada en datos disponibles
    const confidence = this.calculateConfidence(userProfile, candidateProfile);

    const reasoning = this.generateReasoning(factors, this.model.weights);

    const result: MLMatchScore = {
      profileId: candidateProfile.id,
      compatibilityScore: baseCompatibility,
      mlScore: finalScore,
      factors,
      confidence,
      reasoning
    };

    console.log(`🤖 ML Matching: Score calculado`, {
      userId: userProfile.id,
      candidateId: candidateProfile.id,
      mlScore: Math.round(finalScore * 100),
      confidence: Math.round(confidence * 100)
    });

    return result;
  }

  // Compatibilidad de intereses mejorada
  private calculateInterestCompatibility(user: UserProfile, candidate: UserProfile): number {
    const userInterests = new Set(user.interests);
    const candidateInterests = new Set(candidate.interests);
    
    const sharedInterests = [...userInterests].filter(interest => candidateInterests.has(interest));
    const totalInterests = new Set([...userInterests, ...candidateInterests]).size;
    
    if (totalInterests === 0) return 0;
    
    // Bonus por intereses específicos del lifestyle
    const lifestyleInterests = sharedInterests.filter(interest => 
      interest.toLowerCase().includes('lifestyle') || 
      interest.toLowerCase().includes('swinger') ||
      interest.toLowerCase().includes('pareja')
    );
    
    const baseScore = sharedInterests.length / Math.max(userInterests.size, candidateInterests.size);
    const lifestyleBonus = lifestyleInterests.length * 0.2;
    
    return Math.min(baseScore + lifestyleBonus, 1.0);
  }

  // Compatibilidad de comportamiento
  private calculateBehaviorCompatibility(user: UserProfile, candidate: UserProfile): number {
    const userBehavior = user.behaviorData;
    const candidateBehavior = candidate.behaviorData;
    
    // Factores de comportamiento
    const responseRateCompatibility = 1 - Math.abs(userBehavior.responseRate - candidateBehavior.responseRate);
    const activityCompatibility = this.calculateActivityCompatibility(userBehavior, candidateBehavior);
    const communicationCompatibility = this.calculateCommunicationCompatibility(userBehavior, candidateBehavior);
    
    return (responseRateCompatibility + activityCompatibility + communicationCompatibility) / 3;
  }

  // Compatibilidad de actividad
  private calculateActivityCompatibility(userBehavior: UserBehavior, candidateBehavior: UserBehavior): number {
    const userActivity = userBehavior.profileViews + userBehavior.messagesSent;
    const candidateActivity = candidateBehavior.profileViews + candidateBehavior.messagesSent;
    
    if (userActivity === 0 || candidateActivity === 0) return 0.5;
    
    const ratio = Math.min(userActivity, candidateActivity) / Math.max(userActivity, candidateActivity);
    return ratio;
  }

  // Compatibilidad de comunicación
  private calculateCommunicationCompatibility(userBehavior: UserBehavior, candidateBehavior: UserBehavior): number {
    const userConversationLength = userBehavior.averageConversationLength;
    const candidateConversationLength = candidateBehavior.averageConversationLength;
    
    if (userConversationLength === 0 || candidateConversationLength === 0) return 0.5;
    
    const lengthDiff = Math.abs(userConversationLength - candidateConversationLength);
    const maxLength = Math.max(userConversationLength, candidateConversationLength);
    
    return 1 - (lengthDiff / maxLength);
  }

  // Compatibilidad de ubicación
  private calculateLocationCompatibility(user: UserProfile, candidate: UserProfile): number {
    const distance = this.calculateDistance(user.location, candidate.location);
    const maxDistance = user.preferences.maxDistance;
    
    if (distance > maxDistance) return 0;
    
    return 1 - (distance / maxDistance);
  }

  // Calcular distancia entre coordenadas
  private calculateDistance(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLng = this.toRad(loc2.lng - loc1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(loc1.lat)) * Math.cos(this.toRad(loc2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Compatibilidad de preferencias
  private calculatePreferenceCompatibility(user: UserProfile, candidate: UserProfile): number {
    // Verificar rango de edad
    const ageMatch = candidate.age >= user.preferences.ageRange[0] && 
                     candidate.age <= user.preferences.ageRange[1];
    
    if (!ageMatch) return 0;
    
    // Verificar intereses preferidos
    const preferredInterests = new Set(user.preferences.interests);
    const candidateInterests = new Set(candidate.interests);
    
    if (preferredInterests.size === 0) return 1;
    
    const matchingPreferences = [...preferredInterests].filter(interest => 
      candidateInterests.has(interest)
    );
    
    return matchingPreferences.length / preferredInterests.size;
  }

  // Compatibilidad de timing
  private calculateTimingCompatibility(user: UserProfile, candidate: UserProfile): number {
    const userTimes = user.behaviorData.preferredInteractionTimes;
    const candidateTimes = candidate.behaviorData.preferredInteractionTimes;
    
    if (userTimes.length === 0 || candidateTimes.length === 0) return 0.5;
    
    const overlap = userTimes.filter(time => candidateTimes.includes(time));
    const totalUniqueTimes = new Set([...userTimes, ...candidateTimes]).size;
    
    return overlap.length / totalUniqueTimes;
  }

  // Score de prueba social
  private calculateSocialProofScore(candidate: UserProfile): number {
    const behavior = candidate.behaviorData;
    
    // Factores de prueba social
    const matchRatio = behavior.matchedProfiles.length / Math.max(behavior.likedProfiles.length, 1);
    const responseRate = behavior.responseRate;
    const messageRatio = behavior.messagesReceived / Math.max(behavior.messagesSent, 1);
    
    return (matchRatio + responseRate + Math.min(messageRatio, 1)) / 3;
  }

  // Compatibilidad base (algoritmo original)
  private calculateBaseCompatibility(user: UserProfile, candidate: UserProfile): number {
    const sharedInterests = user.interests.filter(interest => 
      candidate.interests.includes(interest)
    );
    
    const totalInterests = Math.max(user.interests.length, candidate.interests.length);
    
    if (totalInterests === 0) return 0;
    
    return sharedInterests.length / totalInterests;
  }

  // Calcular confianza del score
  private calculateConfidence(user: UserProfile, candidate: UserProfile): number {
    const userDataPoints = this.countDataPoints(user);
    const candidateDataPoints = this.countDataPoints(candidate);
    
    const totalDataPoints = userDataPoints + candidateDataPoints;
    const maxPossiblePoints = 20; // Número máximo de puntos de datos
    
    return Math.min(totalDataPoints / maxPossiblePoints, 1.0);
  }

  // Contar puntos de datos disponibles
  private countDataPoints(profile: UserProfile): number {
    let points = 0;
    
    points += profile.interests.length > 0 ? 2 : 0;
    points += profile.behaviorData.likedProfiles.length > 0 ? 2 : 0;
    points += profile.behaviorData.matchedProfiles.length > 0 ? 2 : 0;
    points += profile.behaviorData.messagesSent > 0 ? 1 : 0;
    points += profile.behaviorData.messagesReceived > 0 ? 1 : 0;
    points += profile.behaviorData.responseRate > 0 ? 1 : 0;
    points += profile.behaviorData.preferredInteractionTimes.length > 0 ? 1 : 0;
    
    return points;
  }

  // Generar explicación del score
  private generateReasoning(factors: any, weights: any): string[] {
    const reasoning: string[] = [];
    
    const sortedFactors = Object.entries(factors)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    sortedFactors.forEach(([factor, score]) => {
      const weight = weights[factor];
      const impact = (score as number) * weight;
      
      if (impact > 0.15) {
        reasoning.push(this.getFactorExplanation(factor, score as number));
      }
    });
    
    return reasoning;
  }

  // Explicación de factores
  private getFactorExplanation(factor: string, score: number): string {
    const percentage = Math.round(score * 100);
    
    switch (factor) {
      case 'interests':
        return `${percentage}% compatibilidad en intereses compartidos`;
      case 'behavior':
        return `${percentage}% compatibilidad en patrones de comportamiento`;
      case 'location':
        return `${percentage}% compatibilidad de ubicación`;
      case 'preferences':
        return `${percentage}% coincidencia con preferencias`;
      case 'timing':
        return `${percentage}% compatibilidad de horarios de actividad`;
      case 'socialProof':
        return `${percentage}% score de popularidad y engagement`;
      default:
        return `${percentage}% compatibilidad en ${factor}`;
    }
  }

  // Entrenar modelo con nueva interacción
  async trainModel(example: TrainingExample) {
    console.log(`🤖 ML Training: Nuevo ejemplo de entrenamiento - ${example.outcome}`);
    
    this.trainingExamples.push(example);
    
    // Entrenar cada 10 ejemplos nuevos
    if (this.trainingExamples.length % 10 === 0 && !this.isTraining) {
      await this.performTraining();
    }
    
    // Guardar en cache
    await this.saveModelToCache();
  }

  // Realizar entrenamiento del modelo
  private async performTraining() {
    if (this.isTraining) return;
    
    this.isTraining = true;
    console.log('🤖 ML Training: Iniciando entrenamiento del modelo...');
    
    try {
      // Usar últimos 100 ejemplos para entrenamiento
      const recentExamples = this.trainingExamples.slice(-100);
      
      // Ajustar pesos basado en outcomes exitosos
      const successfulOutcomes = recentExamples.filter(ex => 
        ex.outcome === 'match' || ex.outcome === 'conversation' || ex.outcome === 'long_conversation'
      );
      
      if (successfulOutcomes.length > 0) {
        await this.adjustWeights(successfulOutcomes);
      }
      
      console.log('🤖 ML Training: Entrenamiento completado', {
        totalExamples: this.trainingExamples.length,
        recentExamples: recentExamples.length,
        successfulOutcomes: successfulOutcomes.length,
        newWeights: this.model.weights
      });
      
    } catch (error) {
      console.error('🤖 ML Training: Error durante entrenamiento', error);
    } finally {
      this.isTraining = false;
    }
  }

  // Ajustar pesos del modelo
  private async adjustWeights(successfulExamples: TrainingExample[]) {
    const factorPerformance = {
      interests: 0,
      behavior: 0,
      location: 0,
      preferences: 0,
      timing: 0,
      socialProof: 0
    };
    
    // Calcular performance promedio de cada factor
    for (const example of successfulExamples) {
      const score = await this.calculateMLScore(example.userProfile, example.candidateProfile);
      
      Object.entries(score.factors).forEach(([factor, value]) => {
        factorPerformance[factor as keyof typeof factorPerformance] += value;
      });
    }
    
    // Promediar y ajustar pesos
    Object.keys(factorPerformance).forEach(factor => {
      const avgPerformance = factorPerformance[factor as keyof typeof factorPerformance] / successfulExamples.length;
      const currentWeight = this.model.weights[factor as keyof typeof this.model.weights];
      
      // Ajuste gradual hacia factores más exitosos
      const adjustment = (avgPerformance - 0.5) * this.model.learningRate;
      this.model.weights[factor as keyof typeof this.model.weights] = Math.max(0.05, Math.min(0.5, currentWeight + adjustment));
    });
    
    // Normalizar pesos para que sumen 1
    const totalWeight = Object.values(this.model.weights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(this.model.weights).forEach(factor => {
      this.model.weights[factor as keyof typeof this.model.weights] /= totalWeight;
    });
  }

  // Guardar modelo en cache
  private async saveModelToCache() {
    try {
      await redisCache.set('ml_model', this.model, CacheTTL.VERY_LONG);
      await redisCache.set('ml_training_examples', this.trainingExamples.slice(-500), CacheTTL.VERY_LONG);
    } catch (error) {
      console.error('🤖 ML: Error al guardar modelo en cache', error);
    }
  }

  // Cargar modelo desde cache
  private async loadModelFromCache() {
    try {
      const cachedModel = await redisCache.get<MLModel>('ml_model');
      const cachedExamples = await redisCache.get<TrainingExample[]>('ml_training_examples');
      
      if (cachedModel) {
        this.model = cachedModel;
        console.log('🤖 ML: Modelo cargado desde cache');
      }
      
      if (cachedExamples) {
        this.trainingExamples = cachedExamples;
        console.log('🤖 ML: Ejemplos de entrenamiento cargados desde cache', { count: cachedExamples.length });
      }
    } catch (error) {
      console.error('🤖 ML: Error al cargar modelo desde cache', error);
    }
  }

  // Obtener estadísticas del modelo
  getModelStats() {
    return {
      weights: this.model.weights,
      trainingExamples: this.trainingExamples.length,
      learningRate: this.model.learningRate,
      isTraining: this.isTraining
    };
  }
}

// Instancia singleton
export const mlMatchingEngine = new MLMatchingEngine();

// Funciones de utilidad
export const calculateMLMatch = async (userProfile: UserProfile, candidateProfile: UserProfile): Promise<MLMatchScore> => {
  return await mlMatchingEngine.calculateMLScore(userProfile, candidateProfile);
};

export const recordMatchingOutcome = async (
  userProfile: UserProfile, 
  candidateProfile: UserProfile, 
  outcome: 'like' | 'pass' | 'match' | 'conversation' | 'long_conversation'
) => {
  const example: TrainingExample = {
    userProfile,
    candidateProfile,
    outcome,
    timestamp: Date.now()
  };
  
  await mlMatchingEngine.trainModel(example);
  
  // Track para analytics
  trackInteraction(userProfile.id, 'matching_outcome', outcome);
};

logger.info('🤖 Sistema de ML Matching inicializado', {});
