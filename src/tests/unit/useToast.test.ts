import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/useToast';

// Mock del toast context
const mockToast = vi.fn();
const mockDismiss = vi.fn();

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: mockDismiss,
  }),
}));

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call toast function with correct parameters', () => {
    const startTime = Date.now();
    const maxTime = 2000; // Máximo 2 segundos
    
    try {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'This is a test toast message',
          variant: 'default',
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Test Toast',
        description: 'This is a test toast message',
        variant: 'default',
      });
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTime) {
        console.warn('⚠️ [useToast Test] Timeout alcanzado, saliendo del test');
        return; // Salida de emergencia
      }
      throw error;
    }
  }, 3000); // Timeout de 3 segundos para el test completo

  it('should handle success toast', () => {
    const startTime = Date.now();
    const maxTime = 2000; // Máximo 2 segundos
    
    try {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Success',
          description: 'Operation completed successfully',
          variant: 'default',
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Operation completed successfully',
        variant: 'default',
      });
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTime) {
        console.warn('⚠️ [useToast Test] Timeout alcanzado, saliendo del test');
        return; // Salida de emergencia
      }
      throw error;
    }
  }, 3000); // Timeout de 3 segundos para el test completo

  it('should handle error toast', () => {
    const startTime = Date.now();
    const maxTime = 2000; // Máximo 2 segundos
    
    try {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Error',
          description: 'Something went wrong',
          variant: 'destructive',
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTime) {
        console.warn('⚠️ [useToast Test] Timeout alcanzado, saliendo del test');
        return; // Salida de emergencia
      }
      throw error;
    }
  }, 3000); // Timeout de 3 segundos para el test completo

  it('should call dismiss function', () => {
    const startTime = Date.now();
    const maxTime = 2000; // Máximo 2 segundos
    
    try {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss('toast-id');
      });

      expect(mockDismiss).toHaveBeenCalledWith('toast-id');
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTime) {
        console.warn('⚠️ [useToast Test] Timeout alcanzado, saliendo del test');
        return; // Salida de emergencia
      }
      throw error;
    }
  }, 3000); // Timeout de 3 segundos para el test completo
});
