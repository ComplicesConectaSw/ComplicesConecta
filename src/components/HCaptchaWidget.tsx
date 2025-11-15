import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface HCaptchaWidgetProps {
  siteKey: string;
  onVerify?: (token: string, isValid: boolean) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
}

interface HCaptchaVerifyResponse {
  success: boolean;
  timestamp?: string;
  hostname?: string;
  score?: number;
  errors?: string[];
}

declare global {
  interface Window {
    hcaptcha: {
      render: (container: string | HTMLElement, config: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: (error?: string | undefined) => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact' | 'invisible';
      }) => string;
      reset: (widgetId?: string) => void;
      execute: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
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
      const script = document.createElement('script') as HTMLScriptElement;
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script as Node);
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
          logger.info('hCaptcha token recibido, verificando en backend...', { token: token.substring(0, 10) + '...' });
          
          try {
            if (!supabase) {
              logger.error('Supabase no está disponible');
              if (onError) {
                onError('Supabase no está disponible');
              }
              return;
            }

            // Verify token using Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('hcaptcha-verify', {
              body: { 
                token,
                remoteip: window.location.hostname 
              }
            });

            if (error) {
              logger.error('Error verificando hCaptcha:', { error });
              if (onError) {
                onError('Error de verificación del servidor');
              }
              return;
            }

            const result = data as HCaptchaVerifyResponse;
            logger.info('Resultado verificación hCaptcha:', { success: result.success });

            if (onVerify) {
              onVerify(token, result.success);
            }

            if (!result.success && onError) {
              onError('Verificación fallida: ' + (result.errors?.join(', ') || 'Error desconocido'));
            }

          } catch (error) {
            logger.error('Error en verificación hCaptcha:', { error });
            if (onError) {
              onError('Error de conexión con el servidor');
            }
          }
        },
        'expired-callback': () => {
          logger.info('hCaptcha expirado', {});
          if (onExpire) {
            onExpire();
          }
        },
        'error-callback': (error?: string) => {
          logger.error('Error hCaptcha:', { error });
          if (onError) {
            onError(error || 'Error desconocido en hCaptcha');
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
  const _methodsRef = useRef({
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
