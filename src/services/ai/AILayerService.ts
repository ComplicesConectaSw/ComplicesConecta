/**
 * AI Layer Service - Capa base para funcionalidades ML
 * Inspirado en Grindr 2025: AI en todos los niveles para personalización
 * 
 * Features:
 * - Predicción de compatibilidad con ML
 * - Feature flags para activación gradual
 * - Fallback a scoring legacy (zero breaking changes)
 * - Cache para optimización
 * 
 * v3.5.0-alpha Fase 1.2:
 * - Integración PyTorch/TensorFlow.js
 * - Lazy loading de modelo ML
 * - Tensor management optimizado
 * 
 * @version 3.5.0
 * @date 2025-10-30
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/types/supabase-generated';
import { pytorchModel } from './models/PyTorchScoringModel';
import { logger } from '@/lib/logger';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Perfil con intereses relacionados
 */
interface ProfileWithInterests {
  id: string;
  age?: number | null;
  interests?: Array<{ id: string; [key: string]: unknown }>;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: any;
}

// Types
export interface CompatibilityFeatures {
  likesGiven: number;
  likesReceived: number;
  commentsCount: number;
  proximityKm: number;
  responseTimeMs: number;
  sharedInterestsCount: number;
  ageGap: number;
  bigFiveCompatibility: number; // Del scoring actual
  swingerTraitsScore: number; // Del scoring actual
}

export interface AIConfig {
  enabled: boolean;
  fallbackEnabled: boolean;
  modelEndpoint: string;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface AIScore {
  score: number;
  confidence: number;
  method: 'ai' | 'legacy' | 'hybrid';
  features?: CompatibilityFeatures;
  timestamp: Date;
}

/**
 * AILayerService - Servicio principal de capa AI
 * Maneja predicciones ML con fallback automático a legacy
 */
export class AILayerService {
  private config: AIConfig;
  private cache: Map<string, { score: AIScore; expiresAt: number }>;

  constructor(config?: Partial<AIConfig>) {
    this.config = {
      enabled: import.meta.env.VITE_AI_NATIVE_ENABLED === 'true',
      fallbackEnabled: import.meta.env.VITE_AI_FALLBACK_ENABLED !== 'false', // Default true
      modelEndpoint: import.meta.env.VITE_AI_MODEL_ENDPOINT || '',
      cacheEnabled: import.meta.env.VITE_AI_CACHE_ENABLED !== 'false',
      cacheTTL: parseInt(import.meta.env.VITE_AI_CACHE_TTL || '3600'), // 1 hora default
      ...config,
    };

    this.cache = new Map();
  }

  /**
   * Verifica si AI está habilitado
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Predice compatibilidad entre dos usuarios
   * @param userId1 ID del primer usuario
   * @param userId2 ID del segundo usuario
   * @param legacyScoreFn Función de scoring legacy (fallback)
   * @returns Score de compatibilidad (0-1)
   */
  async predictCompatibility(
    userId1: string,
    userId2: string,
    legacyScoreFn: () => Promise<number>
  ): Promise<AIScore> {
    const cacheKey = this.getCacheKey(userId1, userId2);

    // Check cache
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.debug('Cache hit for compatibility prediction');
        return cached;
      }
    }

    // Si AI no está habilitado, usar legacy
    if (!this.config.enabled) {
      const legacyScore = await legacyScoreFn();
      const result: AIScore = {
        score: legacyScore,
        confidence: 1.0,
        method: 'legacy',
        timestamp: new Date(),
      };
      this.saveToCache(cacheKey, result);
      return result;
    }

    // Intentar predicción ML
    try {
      const features = await this.extractFeatures(userId1, userId2);
      const aiScore = await this.callMLModel(features);

      // Si fallback está habilitado, hacer híbrido
      if (this.config.fallbackEnabled) {
        const legacyScore = await legacyScoreFn();
        // Weighted average: 70% AI, 30% legacy (migración gradual)
        const hybridScore = aiScore * 0.7 + legacyScore * 0.3;

        const result: AIScore = {
          score: hybridScore,
          confidence: 0.85,
          method: 'hybrid',
          features,
          timestamp: new Date(),
        };

        this.saveToCache(cacheKey, result);
        await this.logPrediction(userId1, userId2, result);
        return result;
      }

      const result: AIScore = {
        score: aiScore,
        confidence: 0.9,
        method: 'ai',
        features,
        timestamp: new Date(),
      };

      this.saveToCache(cacheKey, result);
      await this.logPrediction(userId1, userId2, result);
      return result;
    } catch (error) {
      logger.error('ML prediction failed, falling back to legacy', { error });

      if (this.config.fallbackEnabled) {
        const legacyScore = await legacyScoreFn();
        const result: AIScore = {
          score: legacyScore,
          confidence: 1.0,
          method: 'legacy',
          timestamp: new Date(),
        };
        this.saveToCache(cacheKey, result);
        return result;
      }

      throw error;
    }
  }

  /**
   * Extrae features para predicción ML
   * @private
   */
  private async extractFeatures(
    userId1: string,
    userId2: string
  ): Promise<CompatibilityFeatures> {
    if (!supabase) {
      throw new Error('Supabase no está disponible');
    }

    // Obtener perfiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*, interests:swinger_interests(*)')
      .in('id', [userId1, userId2]);

    if (!profiles || profiles.length !== 2) {
      throw new Error('Profiles not found');
    }

    const [user1, user2] = profiles as unknown as ProfileWithInterests[];

    // Feature 1: Likes intercambiados
    const { count: likesGiven } = await supabase
      .from('couple_profile_likes')
      .select('*', { count: 'exact', head: true })
      .eq('liker_id', userId1)
      .eq('liked_id', userId2);

    const { count: likesReceived } = await supabase
      .from('couple_profile_likes')
      .select('*', { count: 'exact', head: true })
      .eq('liker_id', userId2)
      .eq('liked_id', userId1);

    // Feature 2: Comments count (engagement) - usando story_comments
    const { count: commentsCount } = await supabase
      .from('story_comments')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId1},user_id.eq.${userId2}`);

    // Feature 3: Proximidad (Haversine)
    const proximityKm = this.calculateDistance(
      user1.latitude || 0,
      user1.longitude || 0,
      user2.latitude || 0,
      user2.longitude || 0
    );

    // Feature 4: Shared interests
    const user1Interests = new Set(
      user1.interests?.map((i) => i.id).filter((id): id is string => typeof id === 'string') || []
    );
    const user2Interests = new Set(
      user2.interests?.map((i) => i.id).filter((id): id is string => typeof id === 'string') || []
    );
    const sharedInterestsCount = [...user1Interests].filter((i) =>
      user2Interests.has(i)
    ).length;

    // Feature 5: Age gap
    const ageGap = Math.abs((user1.age || 0) - (user2.age || 0));

    // Feature 6: Big Five compatibility (del scoring actual)
    const bigFiveCompatibility = this.calculateBigFiveCompatibility(user1 as any, user2 as any);

    // Feature 7: Swinger traits score (del scoring actual)
    const swingerTraitsScore = this.calculateSwingerTraitsScore(user1 as any, user2 as any);

    // Feature 8: Response time (calcular desde mensajes)
    const responseTimeMs = await this.calculateResponseTime(userId1, userId2);

    return {
      likesGiven: likesGiven || 0,
      likesReceived: likesReceived || 0,
      commentsCount: commentsCount || 0,
      proximityKm,
      responseTimeMs,
      sharedInterestsCount,
      ageGap,
      bigFiveCompatibility,
      swingerTraitsScore,
    };
  }

  /**
   * Calcula el tiempo promedio de respuesta entre dos usuarios basándose en mensajes
   * @private
   */
  private async calculateResponseTime(userId1: string, userId2: string): Promise<number> {
    if (!supabase) {
      return 0;
    }

    try {
      // Obtener mensajes entre los dos usuarios
      // Buscar en chat_messages donde sender_id es uno de los usuarios
      // y room_id contiene mensajes del otro usuario
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('id, sender_id, created_at, room_id')
        .in('sender_id', [userId1, userId2])
        .order('created_at', { ascending: true })
        .limit(100); // Limitar a los últimos 100 mensajes para eficiencia

      if (error || !messages || messages.length < 2) {
        return 0; // No hay suficientes mensajes para calcular
      }

      // Filtrar mensajes que pertenecen a conversaciones entre estos dos usuarios
      // Obtener room_ids donde ambos usuarios han enviado mensajes
      const roomIds = new Set(messages.map(m => m.room_id).filter(Boolean));
      
      if (roomIds.size === 0) {
        return 0; // No hay salas compartidas
      }

      // Verificar que ambos usuarios han enviado mensajes en las mismas salas
      const messagesInSharedRooms = messages.filter(m => 
        m.room_id && roomIds.has(m.room_id)
      );

      if (messagesInSharedRooms.length < 2) {
        return 0; // No hay suficientes mensajes en salas compartidas
      }

      // Calcular tiempos de respuesta
      const responseTimes: number[] = [];
      
      for (let i = 0; i < messagesInSharedRooms.length - 1; i++) {
        const currentMsg = messagesInSharedRooms[i];
        const nextMsg = messagesInSharedRooms[i + 1];

        // Solo calcular si el siguiente mensaje es del otro usuario
        if (currentMsg.sender_id !== nextMsg.sender_id && 
            currentMsg.room_id === nextMsg.room_id &&
            currentMsg.created_at && 
            nextMsg.created_at) {
          
          const currentTime = new Date(currentMsg.created_at).getTime();
          const nextTime = new Date(nextMsg.created_at).getTime();
          const responseTime = nextTime - currentTime;

          // Solo considerar tiempos de respuesta razonables (menos de 7 días)
          if (responseTime > 0 && responseTime < 7 * 24 * 60 * 60 * 1000) {
            responseTimes.push(responseTime);
          }
        }
      }

      if (responseTimes.length === 0) {
        return 0; // No se pudieron calcular tiempos de respuesta
      }

      // Calcular promedio en milisegundos
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      
      return Math.round(avgResponseTime);
    } catch (error) {
      logger.warn('Error calculando tiempo de respuesta', { 
        error: error instanceof Error ? error.message : String(error),
        userId1: userId1.substring(0, 8) + '***',
        userId2: userId2.substring(0, 8) + '***'
      });
      return 0;
    }
  }

  /**
   * Llama al modelo ML para predicción
   * v3.5.0: Usa PyTorch/TensorFlow.js con fallback automático
   * @private
   */
  private async callMLModel(features: CompatibilityFeatures): Promise<number> {
    try {
      // Usar modelo PyTorch/TensorFlow.js (Fase 1.2)
      logger.debug('Using PyTorch model for prediction');
      const score = await pytorchModel.predict(features);
      logger.debug(`PyTorch prediction successful: ${score.toFixed(3)}`);
      return score;
    } catch (error) {
      logger.warn('PyTorch model failed, using fallback algorithm', { error });
      
      // Fallback: algoritmo simple basado en features
      // (mismo que usa PyTorchScoringModel internamente)
      const normalized = {
        likes: Math.min((features.likesGiven + features.likesReceived) / 10, 1),
        engagement: Math.min(features.commentsCount / 50, 1),
        proximity: Math.max(1 - features.proximityKm / 100, 0),
        sharedInterests: Math.min(features.sharedInterestsCount / 10, 1),
        ageGap: Math.max(1 - features.ageGap / 20, 0),
        bigFive: features.bigFiveCompatibility,
        swinger: features.swingerTraitsScore,
      };

      // Weighted sum (pesos ajustables por entrenamiento)
      const score =
        normalized.likes * 0.15 +
        normalized.engagement * 0.1 +
        normalized.proximity * 0.15 +
        normalized.sharedInterests * 0.2 +
        normalized.ageGap * 0.1 +
        normalized.bigFive * 0.2 +
        normalized.swinger * 0.1;

      return Math.min(Math.max(score, 0), 1);
    }
  }

  /**
   * Calcula compatibilidad Big Five (del scoring actual)
   * @private
   */
  private calculateBigFiveCompatibility(_user1: Profile, _user2: Profile): number {
    // Placeholder: implementar lógica real del SmartMatchingService
    return 0.75;
  }

  /**
   * Calcula score de swinger traits (del scoring actual)
   * @private
   */
  private calculateSwingerTraitsScore(_user1: Profile, _user2: Profile): number {
    // Placeholder: implementar lógica real del SmartMatchingService
    return 0.8;
  }

  /**
   * Calcula distancia Haversine (del servicio actual)
   * @private
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Genera cache key
   * @private
   */
  private getCacheKey(userId1: string, userId2: string): string {
    // Ordenar IDs para cache bidireccional
    const [id1, id2] = [userId1, userId2].sort();
    return `ai:compat:${id1}:${id2}`;
  }

  /**
   * Obtiene score del cache
   * @private
   */
  private getFromCache(key: string): AIScore | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.score;
  }

  /**
   * Guarda score en cache
   * @private
   */
  private saveToCache(key: string, score: AIScore): void {
    if (!this.config.cacheEnabled) return;

    this.cache.set(key, {
      score,
      expiresAt: Date.now() + this.config.cacheTTL * 1000,
    });
  }

  /**
   * Registra predicción en DB para análisis
   * @private
   */
  private async logPrediction(
    userId1: string,
    userId2: string,
    score: AIScore
  ): Promise<void> {
    try {
      if (!supabase) {
        logger.warn('Supabase no está disponible, no se puede registrar predicción');
        return;
      }

      const startTime = Date.now();
      const predictionTime = Date.now() - startTime;

      // Registrar en ai_compatibility_scores
      const { error: scoresError } = await supabase
        .from('ai_compatibility_scores')
        .insert({
          user1_id: userId1,
          user2_id: userId2,
          ai_score: score.method === 'ai' || score.method === 'hybrid' ? score.score : null,
          legacy_score: score.method === 'legacy' ? score.score : null,
          final_score: score.score,
          model_version: 'v1-base',
          features: (score.features || {}) as unknown as Json,
        });

      if (scoresError) {
        logger.warn('Failed to log prediction to ai_compatibility_scores', { error: scoresError });
      }

      // Registrar en ai_prediction_logs
      const { error: logsError } = await supabase
        .from('ai_prediction_logs')
        .insert({
          user1_id: userId1,
          user2_id: userId2,
          score: score.score,
          method: score.method,
          model_version: 'v1-base',
          prediction_time_ms: predictionTime,
          cache_hit: this.cache.has(`${userId1}-${userId2}`),
          fallback_used: score.method === 'legacy',
          features: (score.features || {}) as unknown as Json,
          timestamp: new Date().toISOString(),
        });

      if (logsError) {
        logger.warn('Failed to log prediction to ai_prediction_logs', { error: logsError });
      }
    } catch (error) {
      logger.warn('Failed to log prediction', { error });
    }
  }

  /**
   * Registra métricas del modelo de IA
   * @private
   */
  private async logModelMetrics(
    periodStart: string,
    periodEnd: string,
    metrics: {
      predictionsCount: number;
      accuracyScore?: number;
      precisionScore?: number;
      recallScore?: number;
      f1Score?: number;
      avgPredictionTimeMs?: number;
      cacheHitRate?: number;
      errorRate?: number;
      matchRate?: number;
      conversationRate?: number;
      satisfactionScore?: number;
    }
  ): Promise<void> {
    try {
      if (!supabase) {
        logger.warn('Supabase no está disponible, no se puede registrar métricas del modelo');
        return;
      }

      const { error } = await supabase
        .from('ai_model_metrics')
        .insert({
          period_start: periodStart,
          period_end: periodEnd,
          model_version: 'v1-base',
          predictions_count: metrics.predictionsCount,
          accuracy_score: metrics.accuracyScore ?? null,
          precision_score: metrics.precisionScore ?? null,
          recall_score: metrics.recallScore ?? null,
          f1_score: metrics.f1Score ?? null,
          avg_prediction_time_ms: metrics.avgPredictionTimeMs ?? null,
          cache_hit_rate: metrics.cacheHitRate ?? null,
          error_rate: metrics.errorRate ?? null,
          match_rate: metrics.matchRate ?? null,
          conversation_rate: metrics.conversationRate ?? null,
          satisfaction_score: metrics.satisfactionScore ?? null,
        });

      if (error) {
        logger.warn('Failed to log model metrics', { error });
      }
    } catch (error) {
      logger.warn('Failed to log model metrics', { error });
    }
  }

  /**
   * Limpia cache (útil para tests)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const aiLayerService = new AILayerService();

