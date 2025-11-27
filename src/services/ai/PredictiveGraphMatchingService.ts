/**
 * PredictiveGraphMatchingService - Matching Predictivo con Neo4j + IA Emocional
 * 
 * Usa Neo4j: (user)-[:LIKES|DISLIKES|VISITED]->(profile)
 * Friends-of-friends con peso emocional (GPT-4 analiza chats)
 * Score 400k params: compatibilidad + química + valores
 * 
 * @version 3.5.0
 */

import { neo4jService } from '@/services/graph/Neo4jService';
import { emotionalAIService } from './EmotionalAIService';
import { graphMatchingModel } from '@/lib/ai/graphMatchingModel';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { smartMatchingService } from '@/services/SmartMatchingService';

export interface PredictiveMatch {
  userId: string;
  totalScore: number;
  compatibilityScore: number;
  emotionalScore: number;
  socialScore: number;
  graphScore: number;
  reasons: string[];
  confidence: number;
}

export interface PredictiveMatchOptions {
  limit?: number;
  minScore?: number;
  includeEmotionalAnalysis?: boolean;
}

class PredictiveGraphMatchingService {
  private static instance: PredictiveGraphMatchingService;

  static getInstance(): PredictiveGraphMatchingService {
    if (!PredictiveGraphMatchingService.instance) {
      PredictiveGraphMatchingService.instance = new PredictiveGraphMatchingService();
    }
    return PredictiveGraphMatchingService.instance;
  }

  /**
   * Obtiene matches predictivos usando Neo4j + IA Emocional
   */
  async getPredictiveMatches(
    userId: string,
    options: PredictiveMatchOptions = {}
  ): Promise<PredictiveMatch[]> {
    try {
      logger.info('🔮 Obteniendo matches predictivos', {
        userId: userId.substring(0, 8) + '***'
      });

      const limit = options.limit || 20;
      const minScore = options.minScore || 30;

      // 1. Obtener friends-of-friends desde Neo4j
      const fofRecommendations = await neo4jService.getFriendsOfFriends(
        userId,
        limit * 2,
        true // Excluir ya matched
      );

      if (fofRecommendations.length === 0) {
        logger.info('No hay friends-of-friends disponibles');
        return [];
      }

      // 2. Obtener perfiles de candidatos
      const candidateIds = fofRecommendations.map(f => f.userId);
      const candidates = await this.getProfilesByIds(candidateIds);

      if (candidates.length === 0) {
        return [];
      }

      // 3. Calcular scores de compatibilidad tradicionales
      const compatibilityMatches = await smartMatchingService.findMatches(userId, {
        limit: limit * 2
      });

      // 4. Enriquecer con análisis emocional si está habilitado
      const enrichedMatches = await Promise.all(
        fofRecommendations.map(async (fof) => {
          const candidate = candidates.find(c => c.id === fof.userId);
          if (!candidate) return null;

          const compatibilityMatch = compatibilityMatches.matches.find(
            m => m.userId === fof.userId
          );

          // Análisis emocional de chats (si hay conversaciones)
          let emotionalScore = 0;
          let emotionalReasons: string[] = [];

          if (options.includeEmotionalAnalysis !== false) {
            const emotionalAnalysis = await emotionalAIService.analyzeChatEmotions(
              userId,
              fof.userId
            );
            emotionalScore = emotionalAnalysis.score;
            emotionalReasons = emotionalAnalysis.reasons;
          }

          // Score de grafo social (friends-of-friends)
          const graphScore = fof.mutualCount * 5; // +5 puntos por amigo mutuo

          // Score de compatibilidad tradicional
          const compatibilityScore = compatibilityMatch?.totalScore || 0;

          // Calcular score total con modelo ML 400k params
          const totalScore = await graphMatchingModel.predict({
            compatibilityScore,
            emotionalScore,
            graphScore,
            mutualCount: fof.mutualCount,
            pathLength: fof.path.length
          });

          return {
            userId: fof.userId,
            totalScore,
            compatibilityScore,
            emotionalScore,
            socialScore: graphScore,
            graphScore,
            reasons: [
              ...emotionalReasons,
              `${fof.mutualCount} amigos mutuos`,
              `Score de compatibilidad: ${compatibilityScore.toFixed(0)}%`
            ],
            confidence: Math.min(1, (fof.mutualCount / 10) + (emotionalScore / 100))
          } as PredictiveMatch;
        })
      );

      // 5. Filtrar y ordenar
      const filteredMatches = enrichedMatches
        .filter((m): m is PredictiveMatch => m !== null && m.totalScore >= minScore)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);

      logger.info('✅ Matches predictivos obtenidos', {
        count: filteredMatches.length,
        averageScore: filteredMatches.length > 0
          ? filteredMatches.reduce((sum, m) => sum + m.totalScore, 0) / filteredMatches.length
          : 0
      });

      return filteredMatches;
    } catch (error) {
      logger.error('Error obteniendo matches predictivos', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Obtiene perfiles por IDs
   */
  private async getProfilesByIds(ids: string[]): Promise<Array<{ id: string; [key: string]: unknown }>> {
    if (!supabase || ids.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ids);

    if (error || !data) {
      return [];
    }

    return data;
  }
}

export const predictiveGraphMatchingService = PredictiveGraphMatchingService.getInstance();
export default predictiveGraphMatchingService;

