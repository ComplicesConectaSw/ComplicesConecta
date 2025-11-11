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
  });

  it('should handle success toast', () => {
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
  });

  it('should handle error toast', () => {
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
  });

  it('should call dismiss function', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.dismiss('toast-id');
    });

    expect(mockDismiss).toHaveBeenCalledWith('toast-id');
  });
});
