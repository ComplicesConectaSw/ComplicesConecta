/**
 * PyTorch Scoring Model - Unit Tests
 * v3.5.0 - Fase 1.2
 * 
 * Coverage:
 * - Model loading (lazy loading)
 * - Prediction accuracy
 * - Tensor disposal (memory management)
 * - Fallback behavior
 * - Performance (<200ms)
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PyTorchScoringModel } from '@/services/ai/models/PyTorchScoringModel';
import type { CompatibilityFeatures } from '@/services/ai/AILayerService';

describe('PyTorchScoringModel', () => {
  let model: PyTorchScoringModel;
  
  const mockFeatures: CompatibilityFeatures = {
    likesGiven: 5,
    likesReceived: 7,
    commentsCount: 15,
    proximityKm: 10,
    responseTimeMs: 30000,
    sharedInterestsCount: 6,
    ageGap: 3,
    bigFiveCompatibility: 0.85,
    swingerTraitsScore: 0.75,
  };

  beforeEach(() => {
    model = new PyTorchScoringModel({
      modelPath: '/models/compatibility-v1/model.json',
      version: 'v1.0.0-test',
    });
  });

  afterEach(() => {
    // Cleanup después de cada test
    if (model) {
      model.dispose();
    }
  });

  describe('Model Loading', () => {
    it('should not be loaded initially', () => {
      expect(model.isLoaded()).toBe(false);
    });

    it('should load model successfully', async () => {
      await model.load();
      expect(model.isLoaded()).toBe(true);
    });

    it('should not reload if already loaded', async () => {
      await model.load();
      const firstLoad = model.isLoaded();
      
      await model.load(); // Segunda carga
      const secondLoad = model.isLoaded();
      
      expect(firstLoad).toBe(true);
      expect(secondLoad).toBe(true);
    });

    it('should handle loading errors gracefully', async () => {
      const badModel = new PyTorchScoringModel({
        modelPath: '/nonexistent/model.json',
      });
      
      await expect(badModel.load()).rejects.toThrow();
      expect(badModel.isLoaded()).toBe(false);
      
      badModel.dispose();
    });
  });

  describe('Prediction', () => {
    it('should return valid score (0-1 range)', async () => {
      const score = await model.predict(mockFeatures);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return consistent scores for same input', async () => {
      const score1 = await model.predict(mockFeatures);
      const score2 = await model.predict(mockFeatures);
      
      // Scores deben ser iguales (determinístico)
      expect(score1).toBe(score2);
    });

    it('should use fallback when model fails to load', async () => {
      const badModel = new PyTorchScoringModel({
        modelPath: '/nonexistent/model.json',
      });
      
      // Debe usar fallback prediction
      const score = await badModel.predict(mockFeatures);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
      
      badModel.dispose();
    });

    it('should handle edge case features', async () => {
      const edgeCaseFeatures: CompatibilityFeatures = {
        likesGiven: 0,
        likesReceived: 0,
        commentsCount: 0,
        proximityKm: 100,
        responseTimeMs: 0,
        sharedInterestsCount: 0,
        ageGap: 0,
        bigFiveCompatibility: 0,
        swingerTraitsScore: 0,
      };
      
      const score = await model.predict(edgeCaseFeatures);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should handle high values features', async () => {
      const highValuesFeatures: CompatibilityFeatures = {
        likesGiven: 100,
        likesReceived: 100,
        commentsCount: 500,
        proximityKm: 0,
        responseTimeMs: 1000,
        sharedInterestsCount: 20,
        ageGap: 0,
        bigFiveCompatibility: 1.0,
        swingerTraitsScore: 1.0,
      };
      
      const score = await model.predict(highValuesFeatures);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance', () => {
    it('should complete prediction in reasonable time (<500ms)', async () => {
      const startTime = Date.now();
      await model.predict(mockFeatures);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500);
    });

    it('should be faster on subsequent predictions', async () => {
      // Primera predicción (incluye carga del modelo)
      const start1 = Date.now();
      await model.predict(mockFeatures);
      const duration1 = Date.now() - start1;
      
      // Segunda predicción (modelo ya cargado)
      const start2 = Date.now();
      await model.predict(mockFeatures);
      const duration2 = Date.now() - start2;
      
      // Segunda debe ser más rápida (o igual si model.load() es muy rápido)
      expect(duration2).toBeLessThanOrEqual(duration1);
    });
  });

  describe('Memory Management', () => {
    it('should dispose model successfully', () => {
      model.dispose();
      expect(model.isLoaded()).toBe(false);
    });

    it('should handle multiple dispose calls', () => {
      model.dispose();
      model.dispose();
      
      expect(model.isLoaded()).toBe(false);
    });

    it('should reload after dispose', async () => {
      await model.load();
      expect(model.isLoaded()).toBe(true);
      
      model.dispose();
      expect(model.isLoaded()).toBe(false);
      
      await model.load();
      expect(model.isLoaded()).toBe(true);
    });
  });

  describe('Model Info', () => {
    it('should return model info after loading', async () => {
      await model.load();
      const info = model.getModelInfo();
      
      expect(info).toBeDefined();
      expect(info?.version).toBe('v1.0.0-test');
      expect(info?.inputShape).toEqual([1, 8]);
      expect(info?.outputShape).toEqual([1, 1]);
    });

    it('should return null when model not loaded', () => {
      const info = model.getModelInfo();
      expect(info).toBeNull();
    });
  });

  describe('Warmup', () => {
    it('should warmup model successfully', async () => {
      await model.warmup();
      expect(model.isLoaded()).toBe(true);
    });

    it('should improve performance after warmup', async () => {
      await model.warmup();
      
      const startTime = Date.now();
      await model.predict(mockFeatures);
      const duration = Date.now() - startTime;
      
      // Después de warmup, debe ser rápido
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Feature Normalization', () => {
    it('should handle features correctly', async () => {
      // Test que normalización funciona correctamente
      const extremeFeatures: CompatibilityFeatures = {
        likesGiven: 1000, // Mucho más de 10 (max esperado)
        likesReceived: 1000,
        commentsCount: 1000, // Mucho más de 50
        proximityKm: 500, // Mucho más de 100
        responseTimeMs: 600000, // 10 minutos (mucho más de 1 min)
        sharedInterestsCount: 50, // Mucho más de 10
        ageGap: 100, // Mucho más de 20
        bigFiveCompatibility: 1.5, // Fuera de rango (debe clampear a 1)
        swingerTraitsScore: 1.5,
      };
      
      const score = await model.predict(extremeFeatures);
      
      // Debe retornar un score válido (normalización debe clampear)
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid model path in strict mode', async () => {
      const badModel = new PyTorchScoringModel({
        modelPath: 'invalid-path',
      });
      
      await expect(badModel.load()).rejects.toThrow();
      
      badModel.dispose();
    });

    it('should use fallback prediction on model error', async () => {
      const badModel = new PyTorchScoringModel({
        modelPath: '/nonexistent/model.json',
      });
      
      // predict() debe usar fallback internamente
      const score = await badModel.predict(mockFeatures);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
      
      badModel.dispose();
    });
  });

  describe('Singleton Behavior', () => {
    it('should use singleton instance', async () => {
      const { pytorchModel } = await import('@/services/ai/models/PyTorchScoringModel');
      
      await pytorchModel.load();
      const isLoaded1 = pytorchModel.isLoaded();
      
      // Otra instancia debería ver el mismo estado
      const isLoaded2 = pytorchModel.isLoaded();
      
      expect(isLoaded1).toBe(isLoaded2);
      expect(isLoaded1).toBe(true);
      
      pytorchModel.dispose();
    });
  });
});

