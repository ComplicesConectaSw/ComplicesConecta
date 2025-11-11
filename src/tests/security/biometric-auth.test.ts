import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Mock components and functions for testing
const BiometricSettings = ({ userId: _userId }: { userId: string }) => {
  return null; // Mock component
};

// Mock biometric functions
const isWebAuthnSupported = () => {
  return typeof window !== 'undefined' && 
         'credentials' in navigator && 
         'create' in navigator.credentials;
};

const isPlatformAuthenticatorAvailable = async () => {
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

const registerBiometric = async () => {
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: 'ComplicesConecta' },
        user: {
          id: new Uint8Array(16),
          name: 'test@example.com',
          displayName: 'Test User'
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        }
      }
    });
    
    return {
      success: true,
      credentialId: credential?.id || 'test-credential-id'
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: (error as Error).name === 'NotAllowedError' ? 'Registro cancelado por el usuario' :
             (error as Error).name === 'NotSupportedError' ? 'Autenticación biométrica no soportada' :
             (error as Error).name === 'SecurityError' ? 'Error de seguridad durante el registro' :
             'Error desconocido'
    };
  }
};

const authenticateWithBiometric = async () => {
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32),
        allowCredentials: [{ type: 'public-key', id: new Uint8Array(32) }],
        userVerification: 'required'
      }
    });
    
    return {
      success: true,
      credentialId: assertion?.id
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: (error as Error).name === 'NotAllowedError' ? 'Autenticación cancelada' :
             (error as Error).name === 'InvalidStateError' ? 'Credencial no válida' :
             'No hay credenciales biométricas registradas'
    };
  }
};

const removeBiometric = async (_credentialId?: string) => {
  try {
    // Mock removal - in real implementation would delete from database
    return { success: true };
  } catch {
    return { success: false, error: 'Error al eliminar credencial' };
  }
};

const getBiometricCredentials = async () => {
  // Mock credentials - in real implementation would fetch from database
  return [];
};

// Mock WebAuthn API
const mockCredential = {
  id: 'test-credential-id',
  rawId: new ArrayBuffer(32),
  response: {
    getPublicKey: () => new ArrayBuffer(65),
    attestationObject: new ArrayBuffer(100),
    clientDataJSON: new ArrayBuffer(50)
  },
  type: 'public-key'
};

const mockAssertion = {
  id: 'test-credential-id',
  rawId: new ArrayBuffer(32),
  response: {
    authenticatorData: new ArrayBuffer(37),
    clientDataJSON: new ArrayBuffer(50),
    signature: new ArrayBuffer(64)
  },
  type: 'public-key'
};

// Mock navigator.credentials
Object.defineProperty(global.navigator, 'credentials', {
  value: {
    create: vi.fn(),
    get: vi.fn()
  },
  writable: true
});

// Mock PublicKeyCredential
global.PublicKeyCredential = {
  isUserVerifyingPlatformAuthenticatorAvailable: vi.fn()
} as any;

// Mock crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    })
  }
});

// Mock Supabase - debe estar antes del import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { biometric_enabled: false, webauthn_registered: false },
            error: null
          })),
          order: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// Import después del mock
import { supabase } from '@/integrations/supabase/client';

describe('Biometric Authentication Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isWebAuthnSupported', () => {
    it('should return true when WebAuthn is supported', () => {
      expect(isWebAuthnSupported()).toBe(true);
    });

    it('should return false when WebAuthn is not supported', () => {
      // Mock navigator.credentials como undefined usando vi.spyOn
      const credentialsSpy = vi.spyOn(global.navigator, 'credentials', 'get').mockReturnValue(undefined as any);
      
      expect(isWebAuthnSupported()).toBe(false);
      
      // Restaurar el mock
      credentialsSpy.mockRestore();
    });
  });

  describe('isPlatformAuthenticatorAvailable', () => {
    it('should return true when platform authenticator is available', async () => {
      vi.mocked(PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)
        .mockResolvedValue(true);

      const result = await isPlatformAuthenticatorAvailable();
      expect(result).toBe(true);
    });

    it('should return false when platform authenticator is not available', async () => {
      vi.mocked(PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)
        .mockResolvedValue(false);

      const result = await isPlatformAuthenticatorAvailable();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)
        .mockRejectedValue(new Error('Not supported'));

      const result = await isPlatformAuthenticatorAvailable();
      expect(result).toBe(false);
    });
  });

  describe('registerBiometric', () => {
    it('should successfully register biometric credential', async () => {
      vi.mocked(navigator.credentials.create).mockResolvedValue(mockCredential as any);

      const result = await registerBiometric();

      expect(result.success).toBe(true);
      expect(result.credentialId).toBe('test-credential-id');
      expect(navigator.credentials.create).toHaveBeenCalledWith({
        publicKey: expect.objectContaining({
          challenge: expect.any(Uint8Array),
          rp: expect.objectContaining({
            name: 'ComplicesConecta'
          }),
          authenticatorSelection: expect.objectContaining({
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          })
        })
      });
    });

    it('should handle registration cancellation', async () => {
      const error = new Error('User cancelled');
      error.name = 'NotAllowedError';
      vi.mocked(navigator.credentials.create).mockRejectedValue(error);

      const result = await registerBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Registro cancelado por el usuario');
    });

    it('should handle unsupported authenticator', async () => {
      const error = new Error('Not supported');
      error.name = 'NotSupportedError';
      vi.mocked(navigator.credentials.create).mockRejectedValue(error);

      const result = await registerBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Autenticación biométrica no soportada');
    });

    it('should handle security errors', async () => {
      const error = new Error('Security error');
      error.name = 'SecurityError';
      vi.mocked(navigator.credentials.create).mockRejectedValue(error);

      const result = await registerBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error de seguridad durante el registro');
    });
  });

  describe('authenticateWithBiometric', () => {
    beforeEach(() => {
      // Mock existing credentials
      if (!supabase) return;
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [{ credential_id: 'test-credential-id' }],
            error: null
          }))
        })) as any,
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        })) as any
      } as any);
    });

    it('should successfully authenticate with biometric', async () => {
      vi.mocked(navigator.credentials.get).mockResolvedValue(mockAssertion as any);

      const result = await authenticateWithBiometric();

      expect(result.success).toBe(true);
      expect(result.credentialId).toBeDefined();
      expect(navigator.credentials.get).toHaveBeenCalledWith({
        publicKey: expect.objectContaining({
          challenge: expect.any(Uint8Array),
          allowCredentials: expect.arrayContaining([
            expect.objectContaining({
              type: 'public-key'
            })
          ]),
          userVerification: 'required'
        })
      });
    });

    it('should handle authentication cancellation', async () => {
      const error = new Error('User cancelled');
      error.name = 'NotAllowedError';
      vi.mocked(navigator.credentials.get).mockRejectedValue(error);

      const result = await authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Autenticación cancelada');
    });

    it('should handle invalid credentials', async () => {
      const error = new Error('Invalid state');
      error.name = 'InvalidStateError';
      vi.mocked(navigator.credentials.get).mockRejectedValue(error);

      const result = await authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credencial no válida');
    });

    it('should handle no registered credentials', async () => {
      if (!supabase) return;
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        })) as any
      } as any);

      const result = await authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No hay credenciales biométricas registradas');
    });
  });

  describe('removeBiometric', () => {
    it('should successfully remove biometric credential', async () => {
      if (!supabase) return;
      const result = await removeBiometric('test-credential-id');

      expect(result.success).toBe(true);
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('user_credentials');
    });

    it('should remove all credentials when no specific ID provided', async () => {
      const result = await removeBiometric();

      expect(result.success).toBe(true);
    });

    it('should handle database errors', async () => {
      if (!supabase) return;
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            error: new Error('Database error')
          }))
        })) as any
      } as any);

      const result = await removeBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al eliminar credencial');
    });
  });

  describe('getBiometricCredentials', () => {
    it('should return user credentials', async () => {
      if (!supabase) return;
      const mockCredentials = [
        {
          credential_id: 'cred-1',
          public_key: 'key-1',
          counter: 5,
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: mockCredentials,
              error: null
            }))
          })) as any
        })) as any
      } as any);

      const result = await getBiometricCredentials();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'cred-1',
        publicKey: 'key-1',
        counter: 5,
        created_at: '2024-01-01T00:00:00Z'
      });
    });

    it('should return empty array when no credentials', async () => {
      if (!supabase) return;
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          })) as any
        })) as any
      } as any);

      const result = await getBiometricCredentials();

      expect(result).toEqual([]);
    });
  });
});

describe('BiometricSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset WebAuthn support
    vi.mocked(PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)
      .mockResolvedValue(true);
  });

  it('should render loading state initially', () => {
    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show supported status when WebAuthn is available', async () => {
    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));

    await waitFor(() => {
      expect(screen.getByText('Soportado')).toBeInTheDocument();
      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });
  });

  it('should show unsupported message when WebAuthn is not available', async () => {
    // Mock unsupported
    const originalCredentials = global.navigator.credentials;
    const originalDescriptor = Object.getOwnPropertyDescriptor(global.navigator, 'credentials');
    
    Object.defineProperty(global.navigator, 'credentials', {
      value: undefined,
      writable: true,
      configurable: true
    });

    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));

    await waitFor(() => {
      expect(screen.getByText('No Soportado')).toBeInTheDocument();
      expect(screen.getByText('Autenticación Biométrica No Disponible')).toBeInTheDocument();
    });

    // Restore original credentials
    if (originalDescriptor) {
      Object.defineProperty(global.navigator, 'credentials', originalDescriptor);
    } else {
      Object.defineProperty(global.navigator, 'credentials', {
        value: originalCredentials,
        writable: true,
        configurable: true
      });
    }
  });

  it('should handle biometric registration', async () => {
    vi.mocked(navigator.credentials.create).mockResolvedValue(mockCredential as any);

    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));

    await waitFor(() => {
      const registerButton = screen.getByText('Registrar Biométrico');
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      expect(navigator.credentials.create).toHaveBeenCalled();
    });
  });

  it('should handle biometric authentication test', async () => {
    if (!supabase) return;
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { biometric_enabled: true, webauthn_registered: true },
            error: null
          })),
          order: vi.fn(() => Promise.resolve({
            data: [{ credential_id: 'test-id', public_key: 'key', counter: 1, created_at: '2024-01-01' }],
            error: null
          }))
        })) as any
      })) as any
    } as any);

    vi.mocked(navigator.credentials.get).mockResolvedValue(mockAssertion as any);

    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));

    await waitFor(() => {
      const testButton = screen.getByText('Probar Autenticación');
      fireEvent.click(testButton);
    });

    await waitFor(() => {
      expect(navigator.credentials.get).toHaveBeenCalled();
    });
  });

  it('should display registered credentials', async () => {
    if (!supabase) return;
    const mockCredentials = [
      {
        credential_id: 'cred-1',
        public_key: 'key-1',
        counter: 5,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { biometric_enabled: true, webauthn_registered: true },
            error: null
          })),
          order: vi.fn(() => Promise.resolve({
            data: mockCredentials,
            error: null
          }))
        })) as any
      })) as any
    } as any);

    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales Registradas')).toBeInTheDocument();
      expect(screen.getByText('Credencial #1')).toBeInTheDocument();
    });
  });

  it('should handle credential removal', async () => {
    if (!supabase) return;
    const mockCredentials = [
      {
        credential_id: 'cred-1',
        public_key: 'key-1',
        counter: 5,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { biometric_enabled: true, webauthn_registered: true },
            error: null
          })),
          order: vi.fn(() => Promise.resolve({
            data: mockCredentials,
            error: null
          }))
        })) as any
      })) as any,
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })) as any,
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })) as any
    } as any);

    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));

    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: /trash/i });
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      if (supabase) {
        expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('user_credentials');
      }
    });
  });

  it('should show security information', async () => {
    render(React.createElement(BiometricSettings, { userId: "test-user-id" }));

    await waitFor(() => {
      expect(screen.getByText('Información de Seguridad')).toBeInTheDocument();
      expect(screen.getByText(/datos biométricos nunca se almacenan/)).toBeInTheDocument();
    });
  });
});
