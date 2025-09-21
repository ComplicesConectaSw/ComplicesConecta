import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface EmailValidationResult {
  isValid: boolean;
  isUnique: boolean;
  error?: string;
}

/**
 * Valida el formato del email usando regex
 */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Verifica si el email ya existe en la base de datos
 */
export const checkEmailUniqueness = async (email: string): Promise<boolean> => {
  try {
    // Verificar solo en profiles (auth.users no es accesible directamente)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (profileError && profileError.code !== 'PGRST116') {
      logger.error('Error checking profiles:', profileError);
      throw new Error('Error verificando disponibilidad del email');
    }

    return !profiles || profiles.length === 0;
  } catch (error) {
    logger.error('Error in checkEmailUniqueness:', { error });
    throw new Error('Error verificando disponibilidad del email');
  }
};

/**
 * Validación completa del email (formato + unicidad)
 */
export const validateEmail = async (email: string): Promise<EmailValidationResult> => {
  try {
    // Validar formato
    if (!email || email.trim() === '') {
      return {
        isValid: false,
        isUnique: false,
        error: 'El email es requerido'
      };
    }

    if (!validateEmailFormat(email)) {
      return {
        isValid: false,
        isUnique: false,
        error: 'Formato de email inválido'
      };
    }

    // Verificar unicidad
    const isUnique = await checkEmailUniqueness(email);

    if (!isUnique) {
      return {
        isValid: true,
        isUnique: false,
        error: 'Este email ya está registrado'
      };
    }

    return {
      isValid: true,
      isUnique: true
    };
  } catch (error) {
    logger.error('Error in validateEmail:', { error });
    return {
      isValid: false,
      isUnique: false,
      error: error instanceof Error ? error.message : 'Error validando email'
    };
  }
};

/**
 * Validación en tiempo real para formularios
 */
export const validateEmailRealtime = async (
  email: string,
  onValidation: (result: EmailValidationResult) => void,
  debounceMs: number = 500
) => {
  // Debounce para evitar demasiadas consultas
  const timeoutId = setTimeout(async () => {
    if (email && email.length > 3) {
      const result = await validateEmail(email);
      onValidation(result);
    }
  }, debounceMs);

  return () => clearTimeout(timeoutId);
};
