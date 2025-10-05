import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// ✅ MIGRATED: hCaptcha verification moved to Supabase Edge Function
// This client-side utility now calls the secure Edge Function

/**
 * Verifica un token de hCaptcha
 * @param token - Token generado por el widget de hCaptcha
 * @returns Promise con el resultado de la verificación
 */
interface HCaptchaResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export const verifyHCaptcha = async (
  token: string, 
  action: string = 'login', 
  userId?: string
): Promise<HCaptchaResponse> => {
  try {
    // Verificar que el token existe
    if (!token) {
      return {
        success: false,
        message: 'Token de hCaptcha requerido'
      };
    }

    // Llamar a la Edge Function de Supabase para verificación segura
    const { data, error } = await supabase.functions.invoke('hcaptcha-verify', {
      body: { token, action, userId }
    });
    
    if (error) {
      logger.error('Error al verificar hCaptcha:', { error: error.message || String(error) });
      return {
        success: false,
        message: 'Error interno de verificación'
      };
    }

    if (data?.success) {
      logger.info('hCaptcha verificado exitosamente:', data);
      return {
        success: true,
        message: data.message || 'Verificación exitosa',
        data
      };
    } else {
      logger.info('Verificación de hCaptcha falló:', data);
      return {
        success: false,
        message: data?.error || 'Verificación falló',
        data
      };
    }
  } catch (error) {
    logger.error('Error al verificar hCaptcha:', { error: error instanceof Error ? error.message : String(error) });
    return {
      success: false,
      message: 'Error interno de verificación'
    };
  }
};

/**
 * Ejemplo de uso con Edge Function
 */
export const exampleUsage = () => {
  // Ejemplo de cómo usar la función de verificación migrada
  const token = 'token-from-hcaptcha-widget';
  
  void (async () => {
    try {
      const result = await verifyHCaptcha(token, 'registration', 'user-123');
      if (result.success) {
        logger.info('✅ Verificación exitosa!', result.data);
        // Proceder con el registro/login del usuario
      } else {
        logger.error('❌ Verificación fallida:', { message: result.message });
        // Mostrar error al usuario
      }
    } catch (error) {
      logger.error('💥 Error en verificación:', { error: error instanceof Error ? error.message : String(error) });
      // Manejar error de red o servidor
    }
  })();
};

/**
 * Hook React para verificación de hCaptcha
 */
export const useHCaptchaVerification = () => {
  const verifyToken = async (token: string, action?: string, userId?: string) => {
    return await verifyHCaptcha(token, action, userId);
  };

  return { verifyToken };
};
