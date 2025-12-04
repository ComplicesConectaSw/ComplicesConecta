import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Eye, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BiometricAuthService, BiometricAuthResult } from '@/lib/multimediaSecurity';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import { safeGetItem } from '@/utils/safeLocalStorage';

interface BiometricAuthProps {
  onAuthSuccess?: (result: BiometricAuthResult) => void;
  onAuthError?: (error: string) => void;
  requireAuth?: boolean;
  className?: string;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onAuthSuccess,
  onAuthError,
  requireAuth = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authResult, setAuthResult] = useState<BiometricAuthResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    checkRegistrationStatus();
  }, [user]);

  const checkBiometricAvailability = async () => {
    try {
      const availability = await BiometricAuthService.isAvailable();
      setIsAvailable(availability.available);
      setAvailableMethods(availability.methods);
      
      if (!availability.available) {
        setError('Autenticación biométrica no disponible en este dispositivo');
      }
    } catch (error) {
      logger.error('Error checking biometric availability:', { error: error instanceof Error ? error.message : String(error) });
      setError('Error al verificar disponibilidad biométrica');
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user?.id) return;
    
    try {
      // Check if user has registered biometric credentials
      const credentials = safeGetItem<string>(`biometric_credential_${user.id}`, { validate: false, defaultValue: null });
      setIsRegistered(!!credentials);
    } catch (error) {
      logger.error('Error checking registration status:', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  const handleRegister = async () => {
    if (!user?.id || !user?.email) {
      setError('Usuario no autenticado');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const result = await BiometricAuthService.registerBiometric(user.id, user.email);
      
      if (result.success) {
        setIsRegistered(true);
        setAuthResult(result);
        onAuthSuccess?.(result);
      } else {
        setError(result.error || 'Error en el registro biométrico');
        onAuthError?.(result.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      onAuthError?.(errorMessage);
      logger.error('Biometric registration error:', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      return;
    }

    setIsAuthenticating(true);
    setError('');

    try {
      const result = await BiometricAuthService.authenticateBiometric(user.id);
      
      if (result.success) {
        setAuthResult(result);
        onAuthSuccess?.(result);
      } else {
        setError(result.error || 'Error en la autenticación biométrica');
        onAuthError?.(result.error || 'Authentication failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      onAuthError?.(errorMessage);
      logger.error('Error during biometric authentication:', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return <Fingerprint className="h-5 w-5" />;
      case 'face':
        return <Eye className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusIcon = () => {
    if (authResult?.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (error) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (requireAuth && !authResult?.success) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <Shield className="h-5 w-5 text-blue-500" />;
  };

  if (!isAvailable) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticación Biométrica
          </CardTitle>
          <CardDescription>
            Protege tu cuenta con autenticación biométrica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La autenticación biométrica no está disponible en este dispositivo o navegador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Autenticación Biométrica
        </CardTitle>
        <CardDescription>
          {isRegistered 
            ? 'Usa tu huella dactilar o reconocimiento facial para autenticarte'
            : 'Configura la autenticación biométrica para mayor seguridad'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Methods */}
        <div className="flex flex-wrap gap-2">
          {availableMethods.map((method) => (
            <Badge key={method} variant="secondary" className="flex items-center gap-1">
              {getMethodIcon(method)}
              {method === 'fingerprint' ? 'Huella Dactilar' : 'Reconocimiento Facial'}
            </Badge>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {authResult?.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Autenticación biométrica exitosa. Sesión válida hasta: {' '}
              {new Date(authResult.expiresAt).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {!isRegistered ? (
            <Button
              onClick={handleRegister}
              disabled={isRegistering || !isAvailable}
              className="flex items-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              {isRegistering ? 'Registrando...' : 'Configurar Biométrica'}
            </Button>
          ) : (
            <Button
              onClick={handleAuthenticate}
              disabled={isAuthenticating || !isAvailable}
              className="flex items-center gap-2"
              variant={requireAuth && !authResult?.success ? 'default' : 'outline'}
            >
              <Shield className="h-4 w-4" />
              {isAuthenticating ? 'Autenticando...' : 'Autenticar'}
            </Button>
          )}

          {isRegistered && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRegistered(false);
                setAuthResult(null);
                if (user?.id) {
                  localStorage.removeItem(`biometric_credential_${user.id}`);
                }
              }}
            >
              Eliminar Registro
            </Button>
          )}
        </div>

        {/* Registration Status */}
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-gray-300'}`} />
            Estado: {isRegistered ? 'Configurado' : 'No configurado'}
          </div>
          {authResult?.success && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Sesión activa (Confianza: {Math.round(authResult.confidence * 100)}%)
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Información de Seguridad:</p>
              <ul className="space-y-1">
                <li>• Los datos biométricos se almacenan localmente en tu dispositivo</li>
                <li>• Las sesiones expiran automáticamente después de 30 minutos</li>
                <li>• Puedes usar contraseña como método alternativo</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricAuth;

