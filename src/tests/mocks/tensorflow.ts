import { vi } from 'vitest';

// Mock model para TensorFlow.js
const createMockModel = () => {
  const mockTensor = {
    data: vi.fn().mockResolvedValue(new Float32Array([0.65])),
    array: vi.fn().mockResolvedValue([[0.65]]),
    dispose: vi.fn()
  };
  
  return {
    predict: vi.fn().mockReturnValue(mockTensor),
    summary: vi.fn().mockReturnValue('Mock model summary'),
    dispose: vi.fn(),
    layers: []
  };
};

// Mock de TensorFlow.js para tests
export const mockTensorFlow = {
  loadLayersModel: vi.fn((path: string) => {
    // Simular carga exitosa del modelo
    // Manejar tanto rutas relativas como absolutas
    if (path && (path.startsWith('/models/') || path.includes('model.json') || path.startsWith('http'))) {
      console.log(`[Mock TensorFlow] Loading model from: ${path}`);
      return Promise.resolve(createMockModel());
    }
    // Para rutas inválidas, rechazar
    return Promise.reject(new Error(`Failed to load model from: ${path}`));
  }),
  tensor: vi.fn().mockReturnValue({
    data: vi.fn().mockResolvedValue(new Float32Array([0.65])),
    array: vi.fn().mockResolvedValue([[0.65]]),
    dispose: vi.fn()
  }),
  tensor2d: vi.fn().mockReturnValue({
    data: vi.fn().mockResolvedValue(new Float32Array([0.65])),
    array: vi.fn().mockResolvedValue([[0.65]]),
    dispose: vi.fn()
  }),
  dispose: vi.fn(),
  tidy: vi.fn((fn) => fn()),
  engine: {
    startScope: vi.fn(),
    endScope: vi.fn()
  }
};

// Mock global de @tensorflow/tfjs
// Nota: El mock debe estar antes de cualquier import de @tensorflow/tfjs
vi.mock('@tensorflow/tfjs', () => {
  return {
    default: mockTensorFlow,
    loadLayersModel: mockTensorFlow.loadLayersModel,
    tensor: mockTensorFlow.tensor,
    tensor2d: mockTensorFlow.tensor2d,
    dispose: mockTensorFlow.dispose,
    tidy: mockTensorFlow.tidy
  };
});

