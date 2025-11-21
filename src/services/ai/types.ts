/**
 * AI Services - Tipos y Interfaces Compartidas
 * 
 * Archivo creado para romper dependencia circular entre:
 * - AILayerService.ts
 * - models/PyTorchScoringModel.ts
 * 
 * @version 3.7.1
 * @date 2025-11-20
 */

/**
 * Features de compatibilidad para predicción ML
 */
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

/**
 * Configuración del servicio AI
 */
export interface AIConfig {
  enabled: boolean;
  fallbackEnabled: boolean;
  modelEndpoint: string;
  cacheEnabled: boolean;
  cacheTTL: number;
}

/**
 * Score de compatibilidad con metadatos
 */
export interface AIScore {
  score: number;
  confidence: number;
  method: 'ai' | 'legacy' | 'hybrid';
  features?: CompatibilityFeatures;
  timestamp: Date;
}

/**
 * Configuración del modelo PyTorch/TensorFlow.js
 */
export interface ModelConfig {
  modelPath: string;
  inputShape: number[];
  outputShape: number[];
  version: string;
}

/**
 * Perfil con intereses relacionados (para feature extraction)
 */
export interface ProfileWithInterests {
  id: string;
  age?: number | null;
  interests?: Array<{ id: string; [key: string]: unknown }>;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: any;
}
