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
import type { CompatibilityFeatures, ModelConfig } from '../types';
import { logger } from '@/lib/logger';
import { 
  normalizeFeatures, 
  fallbackPrediction, 
  generateDummyFeatures 
} from '../utils';

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
      logger.debug('Model already loaded');
      return;
    }

    // Si está cargando, esperar
    if (this.isLoading) {
      logger.debug('Model is loading, waiting...');
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    const startTime = Date.now();

    try {
      logger.info(`Loading model from: ${this.config.modelPath}`);
      
      // En desarrollo/producción, el modelo debe estar en public/models/
      // TODO: En producción real, cargar desde CDN o S3
      // En tests, el mock de TensorFlow manejará esto
      try {
        this.model = await tf.loadLayersModel(this.config.modelPath);
      } catch (loadError) {
        // Si falla la carga (ej: en tests sin modelo real), usar fallback
        if (typeof window !== 'undefined' && this.config.modelPath.startsWith('/models/')) {
          // En ambiente de tests, permitir que el mock maneje el error
          throw loadError;
        }
        throw loadError;
      }
      
      const loadTime = Date.now() - startTime;
      logger.info(`Model loaded successfully in ${loadTime}ms`, {
        version: this.config.version,
        inputShape: this.config.inputShape,
        outputShape: this.config.outputShape
      });
    } catch (error) {
      logger.error('Error loading model', { error });
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
      } catch {
        logger.error('Model load failed, using fallback');
        return fallbackPrediction(features);
      }
    }

    // Normalizar features (0-1 range)
    const normalizedFeatures = normalizeFeatures(features);

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
      // Si no hay modelo después de intentar cargar, usar fallback
      if (!this.model) {
        logger.warn('Model not available, using fallback');
        inputTensor.dispose();
        return fallbackPrediction(features);
      }

      // Predicción ML
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      
      // Intentar obtener datos usando .data() primero, luego .array() como fallback
      let score: number;
      try {
        const scoreData = await prediction.data();
        score = scoreData[0];
      } catch {
        // Fallback a .array() si .data() falla
        const scoreArray = await prediction.array();
        score = (scoreArray as number[][])[0][0];
      }

      // Limpiar tensors para evitar memory leaks
      inputTensor.dispose();
      prediction.dispose();

      // Clamp score al rango válido (0-1)
      const clampedScore = Math.min(Math.max(score, 0), 1);
      
      logger.debug(`Prediction: ${clampedScore.toFixed(3)}`);
      
      return clampedScore;
    } catch (error) {
      // Cleanup en caso de error
      try {
        inputTensor.dispose();
      } catch {
        // Ignorar errores de cleanup
      }
      logger.error('Prediction error', { error });
      
      // Fallback a algoritmo simple
      return fallbackPrediction(features);
    }
  }


  /**
   * Limpia recursos del modelo
   * Importante llamar cuando ya no se necesita el modelo
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      logger.info('Model disposed, memory freed');
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

    logger.info('Warming up model...');
    
    // Predicción dummy usando función compartida
    const dummyFeatures = generateDummyFeatures();
    await this.predict(dummyFeatures);
    
    logger.info('Model warmed up');
  }
}

// Singleton instance para reutilizar modelo en toda la app
// Solo se carga una vez en memoria
export const pytorchModel = new PyTorchScoringModel();

