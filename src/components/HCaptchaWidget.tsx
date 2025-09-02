import React, { useRef, useEffect, useState } from 'react';
import { verifyHCaptcha } from '@/utils/hcaptcha-verify';

interface HCaptchaWidgetProps {
  siteKey: string;
  onVerify?: (token: string, isValid: boolean) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
}

declare global {
  interface Window {
    hcaptcha: any;
  }
}

export const HCaptchaWidget: React.FC<HCaptchaWidgetProps> = ({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'dark',
  size = 'normal',
  className = ''
}) => {
  const hcaptchaRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar el script de hCaptcha si no está cargado
    if (!window.hcaptcha) {
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && window.hcaptcha && hcaptchaRef.current && !widgetId) {
      const id = window.hcaptcha.render(hcaptchaRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: async (token: string) => {
          console.log('hCaptcha token recibido:', token);
          
          // Verificar el token automáticamente
          try {
            const result = await verifyHCaptcha(token);
            if (onVerify) {
              onVerify(token, result.success);
            }
          } catch (error) {
            console.error('Error verificando hCaptcha:', error);
            if (onError) {
              onError('Error de verificación');
            }
          }
        },
        'expired-callback': () => {
          console.log('hCaptcha expirado');
          if (onExpire) {
            onExpire();
          }
        },
        'error-callback': (error: string) => {
          console.error('Error hCaptcha:', error);
          if (onError) {
            onError(error);
          }
        }
      });
      setWidgetId(id);
    }
  }, [isLoaded, siteKey, theme, size, onVerify, onError, onExpire, widgetId]);

  const reset = () => {
    if (window.hcaptcha && widgetId) {
      window.hcaptcha.reset(widgetId);
    }
  };

  const execute = () => {
    if (window.hcaptcha && widgetId) {
      window.hcaptcha.execute(widgetId);
    }
  };

  // Exponer métodos para uso externo mediante un ref separado
  const methodsRef = useRef({
    reset,
    execute
  });

  return (
    <div className={`hcaptcha-container ${className}`}>
      <div ref={hcaptchaRef} />
      {!isLoaded && (
        <div className="text-sm text-muted-foreground">
          Cargando verificación...
        </div>
      )}
    </div>
  );
};
