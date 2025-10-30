# 🧠 FASE 1.2: PYTORCH INTEGRATION - ComplicesConecta v3.5.0

**Fecha Inicio:** 30 de Octubre, 2025 - 17:00 hrs  
**Duración Estimada:** 3 días  
**Estado:** 🚀 Iniciando

---

## 🎯 OBJETIVO

Integrar modelo PyTorch pre-entrenado para scoring de compatibilidad usando **TensorFlow.js**, con lazy loading para optimización mobile y cache Redis para performance.

---

## 📋 TAREAS (8 subtareas)

### 1. Instalar Dependencias (30 min)
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node onnxruntime-web
```

### 2. Crear PyTorchScoringModel (2 horas)
Archivo: `src/services/ai/models/PyTorchScoringModel.ts`

**Features:**
- Cargar modelo convertido (PyTorch → TensorFlow.js)
- Input: 8 features (likes, proximidad, intereses, etc.)
- Output: Score de compatibilidad (0-1)
- Normalización de features
- Tensor management (dispose)

### 3. Convertir Modelo PyTorch → TensorFlow.js (1 hora)
```python
# Script Python para conversión
import torch
import onnx
import tf2onnx

# Cargar modelo PyTorch
model = torch.load('compatibility_model.pth')

# Exportar a ONNX
torch.onnx.export(model, dummy_input, 'model.onnx')

# Convertir ONNX → TensorFlow.js
# tensorflowjs_converter --input_format=onnx model.onnx model_tfjs/
```

### 4. Lazy Loading para Mobile (1 hora)
- Cargar modelo solo cuando sea necesario
- Mostrar loading spinner
- Fallback si modelo no carga

### 5. Integración en AILayerService (2 horas)
- Reemplazar `callMLModel()` con PyTorchScoringModel
- Cache de predicciones
- Error handling robusto

### 6. Tests Unitarios (2 horas)
- Test de carga de modelo
- Test de predicción
- Test de tensor disposal
- Test de performance (<500ms)

### 7. Benchmark de Performance (1 hora)
- Medir tiempo de carga
- Medir tiempo de predicción
- Comparar con scoring legacy

### 8. Documentación (1 hora)
- README actualizado
- Guía de entrenamiento de modelo
- Métricas de accuracy

---

## 📊 MÉTRICAS OBJETIVO

- **Carga de modelo:** <2s (primera vez)
- **Predicción:** <200ms (P99)
- **Memoria:** <50MB (modelo)
- **Accuracy:** >85%
- **Cache hit rate:** >70%

---

## 🚀 IMPLEMENTACIÓN

### Paso 1: Instalar TensorFlow.js

```bash
npm install --save @tensorflow/tfjs @tensorflow/tfjs-node onnxruntime-web
```

### Paso 2: Crear PyTorchScoringModel.ts

**Ubicación:** `src/services/ai/models/PyTorchScoringModel.ts`

```typescript
import * as tf from '@tensorflow/tfjs';
import type { CompatibilityFeatures } from '../AILayerService';

export class PyTorchScoringModel {
  private model: tf.LayersModel | null = null;
  private isLoading: boolean = false;
  private modelPath: string;

  constructor(modelPath: string = '/models/compatibility-v1/model.json') {
    this.modelPath = modelPath;
  }

  /**
   * Carga el modelo TensorFlow.js (convertido desde PyTorch)
   */
  async load(): Promise<void> {
    if (this.model) return;
    if (this.isLoading) {
      // Esperar a que termine la carga actual
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    try {
      console.log('[PyTorch] Loading model from:', this.modelPath);
      this.model = await tf.loadLayersModel(this.modelPath);
      console.log('[PyTorch] Model loaded successfully');
    } catch (error) {
      console.error('[PyTorch] Error loading model:', error);
      throw new Error(`Failed to load PyTorch model: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Predice compatibilidad usando el modelo ML
   */
  async predict(features: CompatibilityFeatures): Promise<number> {
    if (!this.model) {
      await this.load();
    }

    // Normalizar features (0-1 range)
    const normalizedFeatures = this.normalizeFeatures(features);

    // Crear tensor de input
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
    ]);

    try {
      // Predicción
      const prediction = this.model!.predict(inputTensor) as tf.Tensor;
      const score = (await prediction.data())[0];

      // Limpiar tensors
      inputTensor.dispose();
      prediction.dispose();

      // Clamp score (0-1)
      return Math.min(Math.max(score, 0), 1);
    } catch (error) {
      inputTensor.dispose();
      console.error('[PyTorch] Prediction error:', error);
      throw error;
    }
  }

  /**
   * Normaliza features al rango 0-1
   */
  private normalizeFeatures(features: CompatibilityFeatures): Record<string, number> {
    return {
      likesGiven: Math.min(features.likesGiven / 10, 1),
      likesReceived: Math.min(features.likesReceived / 10, 1),
      commentsCount: Math.min(features.commentsCount / 50, 1),
      proximityKm: Math.max(1 - features.proximityKm / 100, 0),
      responseTimeMs: Math.max(1 - features.responseTimeMs / 60000, 0), // 1 min max
      sharedInterestsCount: Math.min(features.sharedInterestsCount / 10, 1),
      ageGap: Math.max(1 - features.ageGap / 20, 0),
      bigFiveCompatibility: features.bigFiveCompatibility,
    };
  }

  /**
   * Limpia recursos del modelo
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      console.log('[PyTorch] Model disposed');
    }
  }

  /**
   * Verifica si el modelo está cargado
   */
  isLoaded(): boolean {
    return this.model !== null;
  }
}

// Singleton para reutilizar modelo
export const pytorchModel = new PyTorchScoringModel();
```

### Paso 3: Actualizar AILayerService

**Modificar:** `src/services/ai/AILayerService.ts`

```typescript
import { pytorchModel } from './models/PyTorchScoringModel';

// En callMLModel():
private async callMLModel(features: CompatibilityFeatures): Promise<number> {
  try {
    // Usar modelo PyTorch/TensorFlow.js
    const score = await pytorchModel.predict(features);
    return score;
  } catch (error) {
    console.error('[AI] ML model prediction failed:', error);
    
    // Fallback: algoritmo simple basado en features
    const normalized = {
      likes: Math.min((features.likesGiven + features.likesReceived) / 10, 1),
      engagement: Math.min(features.commentsCount / 50, 1),
      proximity: Math.max(1 - features.proximityKm / 100, 0),
      sharedInterests: Math.min(features.sharedInterestsCount / 10, 1),
      ageGap: Math.max(1 - features.ageGap / 20, 0),
      bigFive: features.bigFiveCompatibility,
      swinger: features.swingerTraitsScore,
    };

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
```

### Paso 4: Lazy Loading Component

**Nuevo:** `src/components/ai/ModelLoader.tsx`

```typescript
import { useEffect, useState } from 'react';
import { pytorchModel } from '@/services/ai/models/PyTorchScoringModel';

export const useModelLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadModel = async () => {
    if (pytorchModel.isLoaded()) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await pytorchModel.load();
      setIsLoaded(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load solo si AI está habilitado
    if (import.meta.env.VITE_AI_NATIVE_ENABLED === 'true') {
      loadModel();
    }
  }, []);

  return { isLoading, isLoaded, error, loadModel };
};
```

---

## ✅ CHECKLIST

- [ ] Instalar @tensorflow/tfjs
- [ ] Crear PyTorchScoringModel.ts
- [ ] Convertir modelo PyTorch → TensorFlow.js
- [ ] Integrar en AILayerService
- [ ] Lazy loading component
- [ ] Tests unitarios (>98% coverage)
- [ ] Benchmark performance
- [ ] Documentación actualizada
- [ ] Linting passing
- [ ] Commit y push

---

## 🎯 PRÓXIMO (Después de 1.2)

**Fase 1.3: Chat Summaries ML** (2 días)
- GPT-4 o BART fine-tuned
- Resúmenes automáticos de conversaciones
- UI en ChatHeader
- Rate limiting

---

**Tiempo Estimado:** 3 días (24 horas)  
**Progreso Global:** 8% → 20% (+12%)

---

*Fase 1.2 - PyTorch Integration - ComplicesConecta v3.5.0*

