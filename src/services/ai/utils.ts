/**
 * AI Services - Utilidades Compartidas
 * 
 * Funciones helper reutilizables entre servicios AI
 * Evita duplicación de código entre AILayerService y PyTorchScoringModel
 * 
 * @version 3.7.1
 * @date 2025-11-20
 */

import type { CompatibilityFeatures } from './types';
import { logger } from '@/lib/logger';

/**
 * Calcula distancia Haversine entre dos puntos geográficos
 * 
 * @param lat1 Latitud del primer punto
 * @param lon1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lon2 Longitud del segundo punto
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
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
 * Normaliza features al rango 0-1 para ML
 * 
 * Normalización basada en rangos típicos observados:
 * - Likes: 0-10 (10+ es excepcional)
 * - Comments: 0-50 (50+ es muy activo)
 * - Proximity: 0-100 km (100+ km es lejano)
 * - Interests: 0-10 compartidos
 * - Age gap: 0-20 años
 * - Big Five: ya normalizado (0-1)
 * 
 * @param features Features sin normalizar
 * @returns Features normalizadas (0-1)
 */
export function normalizeFeatures(features: CompatibilityFeatures): Record<string, number> {
  return {
    likesGiven: Math.min(features.likesGiven / 10, 1),
    likesReceived: Math.min(features.likesReceived / 10, 1),
    commentsCount: Math.min(features.commentsCount / 50, 1),
    proximityKm: Math.max(1 - features.proximityKm / 100, 0), // Invertir (más cerca = mejor)
    responseTimeMs: Math.max(1 - features.responseTimeMs / 60000, 0), // 1 min max, invertir
    sharedInterestsCount: Math.min(features.sharedInterestsCount / 10, 1),
    ageGap: Math.max(1 - features.ageGap / 20, 0), // Invertir (menor gap = mejor)
    bigFiveCompatibility: features.bigFiveCompatibility, // Ya normalizado
    swingerTraitsScore: features.swingerTraitsScore, // Ya normalizado
  };
}

/**
 * Algoritmo de predicción fallback cuando ML no está disponible
 * Usa weighted sum de features normalizadas
 * 
 * @param features Features de compatibilidad
 * @returns Score de compatibilidad (0-1)
 */
export function fallbackPrediction(features: CompatibilityFeatures): number {
  logger.debug('Using fallback prediction algorithm');
  
  const normalized = normalizeFeatures(features);

  // Weighted sum (pesos ajustables por entrenamiento)
  const score =
    normalized.likesGiven * 0.15 +
    normalized.likesReceived * 0.15 +
    normalized.commentsCount * 0.1 +
    normalized.proximityKm * 0.15 +
    normalized.responseTimeMs * 0.05 +
    normalized.sharedInterestsCount * 0.2 +
    normalized.ageGap * 0.1 +
    normalized.bigFiveCompatibility * 0.1;

  return Math.min(Math.max(score, 0), 1);
}

/**
 * Valida que las features estén en rangos esperados
 * Útil para debugging y validación de datos
 * 
 * @param features Features a validar
 * @returns true si son válidas, false si hay problemas
 */
export function validateFeatures(features: CompatibilityFeatures): boolean {
  const issues: string[] = [];

  if (features.likesGiven < 0) issues.push('likesGiven negativo');
  if (features.likesReceived < 0) issues.push('likesReceived negativo');
  if (features.commentsCount < 0) issues.push('commentsCount negativo');
  if (features.proximityKm < 0) issues.push('proximityKm negativo');
  if (features.responseTimeMs < 0) issues.push('responseTimeMs negativo');
  if (features.sharedInterestsCount < 0) issues.push('sharedInterestsCount negativo');
  if (features.ageGap < 0) issues.push('ageGap negativo');
  if (features.bigFiveCompatibility < 0 || features.bigFiveCompatibility > 1) {
    issues.push('bigFiveCompatibility fuera de rango 0-1');
  }
  if (features.swingerTraitsScore < 0 || features.swingerTraitsScore > 1) {
    issues.push('swingerTraitsScore fuera de rango 0-1');
  }

  if (issues.length > 0) {
    logger.warn('Features validation failed', { issues, features });
    return false;
  }

  return true;
}

/**
 * Genera features dummy para testing y warmup
 * 
 * @returns Features de ejemplo válidas
 */
export function generateDummyFeatures(): CompatibilityFeatures {
  return {
    likesGiven: 5,
    likesReceived: 5,
    commentsCount: 10,
    proximityKm: 20,
    responseTimeMs: 30000, // 30 segundos
    sharedInterestsCount: 5,
    ageGap: 3,
    bigFiveCompatibility: 0.8,
    swingerTraitsScore: 0.75,
  };
}
