import React, { useState } from 'react';
import { HCaptchaWidget } from '@/components/HCaptchaWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Shield } from 'lucide-react';

/**
 * Ejemplo completo de implementación de hCaptcha
 * Muestra cómo integrar y verificar hCaptcha en un formulario
 */
export const HCaptchaExample: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Site key de hCaptcha (obtener de hcaptcha.com)
  const HCAPTCHA_SITE_KEY = process.env.VITE_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001';

  const handleVerify = (captchaToken: string, isValid: boolean) => {
    console.log('Verificación hCaptcha:', { token: captchaToken, valid: isValid });
    
    if (isValid) {
      setToken(captchaToken);
      setIsVerified(true);
      setError('');
    } else {
      setToken('');
      setIsVerified(false);
      setError('Verificación de hCaptcha falló');
    }
  };

  const handleError = (errorMessage: string) => {
    console.error('Error hCaptcha:', errorMessage);
    setError(`Error: ${errorMessage}`);
    setIsVerified(false);
    setToken('');
  };

  const handleExpire = () => {
    console.log('hCaptcha expirado');
    setIsVerified(false);
    setToken('');
    setError('La verificación ha expirado. Por favor, verifica nuevamente.');
  };

  const handleSubmit = async () => {
    if (!isVerified || !token) {
      setError('Por favor, completa la verificación hCaptcha');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Aquí harías la llamada a tu API para procesar el formulario
      // La API debe verificar el token en el servidor
      console.log('Enviando formulario con token:', token);
      
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('¡Formulario enviado exitosamente!');
      
    } catch (error) {
      console.error('Error enviando formulario:', error);
      setError('Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ejemplo hCaptcha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Widget de hCaptcha */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Verificación de seguridad:
            </label>
            <HCaptchaWidget
              siteKey={HCAPTCHA_SITE_KEY}
              onVerify={handleVerify}
              onError={handleError}
              onExpire={handleExpire}
              theme="dark"
              size="normal"
              className="flex justify-center"
            />
          </div>

          {/* Estado de verificación */}
          {isVerified && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                ✅ Verificación completada exitosamente
              </AlertDescription>
            </Alert>
          )}

          {/* Errores */}
          {error && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Botón de envío */}
          <Button 
            onClick={handleSubmit}
            disabled={!isVerified || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
          </Button>

          {/* Información de desarrollo */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Site Key:</strong> {HCAPTCHA_SITE_KEY}</p>
            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No generado'}</p>
            <p><strong>Estado:</strong> {isVerified ? 'Verificado' : 'Pendiente'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
