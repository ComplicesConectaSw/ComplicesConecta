/**
 * PyTorch Scoring Model - ML-powered compatibility prediction
 * Versión: 3.5.0 - Fase 1.2
 * 
 * Integra modelo PyTorch convertido a TensorFlow.js para scoring
 * de compatibilidad basado en 8 features de engagement y personalidad.
 * 
 * Features:
 * - Lazy loading (solo carga cuando se necesita)
 * - Tensor management (dispose automático)
 * - Normalización de features
 * - Error handling robusto
 * - Fallback a algoritmo simple
 * 
 * @version 3.5.0
 * @date 2025-10-30
 */

import * as tf from '@tensorflow/tfjs';
import type { CompatibilityFeatures } from '../AILayerService';

export interface ModelConfig {
  modelPath: string;
  inputShape: number[];
  outputShape: number[];
  version: string;
}

/**
 * PyTorchScoringModel - Modelo ML para scoring de compatibilidad
 * 
 * Este modelo ha sido pre-entrenado en PyTorch y convertido a TensorFlow.js
 * para ejecución en el navegador. Predice compatibilidad basado en 8 features.
 */
export class PyTorchScoringModel {
  private model: tf.LayersModel | null = null;
  private isLoading: boolean = false;
  private config: ModelConfig;

  constructor(config?: Partial<ModelConfig>) {
    this.config = {
      modelPath: config?.modelPath || '/models/compatibility-v1/model.json',
      inputShape: config?.inputShape || [1, 8],
      outputShape: config?.outputShape || [1, 1],
      version: config?.version || 'v1.0.0',
    };
  }

  /**
   * Carga el modelo TensorFlow.js (convertido desde PyTorch)
   * Solo se carga una vez (singleton pattern)
   */
  async load(): Promise<void> {
    // Si ya está cargado, return
    if (this.model) {
      console.log('[PyTorch] Model already loaded');
      return;
    }

    // Si está cargando, esperar
    if (this.isLoading) {
      console.log('[PyTorch] Model is loading, waiting...');
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    const startTime = Date.now();

    try {
      console.log(`[PyTorch] Loading model from: ${this.config.modelPath}`);
      
      // En desarrollo/producción, el modelo debe estar en public/models/
      // TODO: En producción real, cargar desde CDN o S3
      this.model = await tf.loadLayersModel(this.config.modelPath);
      
      const loadTime = Date.now() - startTime;
      console.log(`[PyTorch] ✅ Model loaded successfully in ${loadTime}ms`);
      console.log(`[PyTorch] Model version: ${this.config.version}`);
      console.log(`[PyTorch] Input shape: ${this.config.inputShape}`);
      console.log(`[PyTorch] Output shape: ${this.config.outputShape}`);
    } catch (error) {
      console.error('[PyTorch] ❌ Error loading model:', error);
      this.model = null;
      throw new Error(`Failed to load PyTorch model: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Predice compatibilidad usando el modelo ML
   * 
   * @param features - Features extraídas de perfiles (8 dimensiones)
   * @returns Score de compatibilidad (0-1)
   */
  async predict(features: CompatibilityFeatures): Promise<number> {
    // Cargar modelo si no está cargado
    if (!this.model) {
      try {
        await this.load();
      } catch (error) {
        console.error('[PyTorch] Model load failed, using fallback');
        return this.fallbackPrediction(features);
      }
    }

    // Normalizar features (0-1 range)
    const normalizedFeatures = this.normalizeFeatures(features);

    // Crear tensor de input [1, 8]
    const inputTensor = tf.tensor2d([
      [
        normalizedFeatures.likesGiven,
        normalizedFeatures.likesReceived,
        normalizedFeatures.commentsCount,
        normalizedFeatures.proximityKm,
        normalizedFeatures.responseTimeMs,
        normalizedFeatures.sharedInterestsCount,
        normalizedFeatures.ageGap,
        normalizedFeatures.bigFiveCompatibility,
      ]
    ], this.config.inputShape as [number, number]);

    try {
      // Predicción ML
      const prediction = this.model!.predict(inputTensor) as tf.Tensor;
      const scoreArray = await prediction.data();
      const score = scoreArray[0];

      // Limpiar tensors para evitar memory leaks
      inputTensor.dispose();
      prediction.dispose();

      // Clamp score al rango válido (0-1)
      const clampedScore = Math.min(Math.max(score, 0), 1);
      
      console.log(`[PyTorch] Prediction: ${clampedScore.toFixed(3)}`);
      
      return clampedScore;
    } catch (error) {
      // Cleanup en caso de error
      inputTensor.dispose();
      console.error('[PyTorch] Prediction error:', error);
      
      // Fallback a algoritmo simple
      return this.fallbackPrediction(features);
    }
  }

  /**
   * Normaliza features al rango 0-1
   * 
   * Normalización basada en rangos típicos observados:
   * - Likes: 0-10 (10+ es excepcional)
   * - Comments: 0-50 (50+ es muy activo)
   * - Proximity: 0-100 km (100+ km es lejano)
   * - Interests: 0-10 compartidos
   * - Age gap: 0-20 años
   * - Big Five: ya normalizado (0-1)
   * 
   * @private
   */
  private normalizeFeatures(features: CompatibilityFeatures): Record<string, number> {
    return {
      likesGiven: Math.min(features.likesGiven / 10, 1),
      likesReceived: Math.min(features.likesReceived / 10, 1),
      commentsCount: Math.min(features.commentsCount / 50, 1),
      proximityKm: Math.max(1 - features.proximityKm / 100, 0), // Invertir (más cerca = mejor)
      responseTimeMs: Math.max(1 - features.responseTimeMs / 60000, 0), // 1 min max, invertir
      sharedInterestsCount: Math.min(features.sharedInterestsCount / 10, 1),
      ageGap: Math.max(1 - features.ageGap / 20, 0), // Invertir (menor gap = mejor)
      bigFiveCompatibility: features.bigFiveCompatibility, // Ya normalizado
    };
  }

  /**
   * Predicción fallback usando algoritmo simple
   * Se usa cuando el modelo ML falla o no está disponible
   * 
   * @private
   */
  private fallbackPrediction(features: CompatibilityFeatures): number {
    console.log('[PyTorch] Using fallback prediction algorithm');
    
    const normalized = this.normalizeFeatures(features);

    // Weighted sum (pesos ajustables)
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
   * Limpia recursos del modelo
   * Importante llamar cuando ya no se necesita el modelo
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      console.log('[PyTorch] Model disposed, memory freed');
    }
  }

  /**
   * Verifica si el modelo está cargado
   */
  isLoaded(): boolean {
    return this.model !== null && !this.isLoading;
  }

  /**
   * Obtiene información del modelo
   */
  getModelInfo(): ModelConfig | null {
    if (!this.model) return null;
    return this.config;
  }

  /**
   * Warmup: ejecuta predicción dummy para optimizar performance
   * Útil para pre-cargar el modelo antes de uso real
   */
  async warmup(): Promise<void> {
    if (!this.model) {
      await this.load();
    }

    console.log('[PyTorch] Warming up model...');
    
    // Predicción dummy
    const dummyFeatures: CompatibilityFeatures = {
      likesGiven: 5,
      likesReceived: 5,
      commentsCount: 10,
      proximityKm: 20,
      responseTimeMs: 30000,
      sharedInterestsCount: 5,
      ageGap: 3,
      bigFiveCompatibility: 0.8,
      swingerTraitsScore: 0.75,
    };

    await this.predict(dummyFeatures);
    
    console.log('[PyTorch] Model warmed up');
  }
}

// Singleton instance para reutilizar modelo en toda la app
// Solo se carga una vez en memoria
export const pytorchModel = new PyTorchScoringModel();

