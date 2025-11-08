// =====================================================
// EMAIL VALIDATION COMPONENT
// Fecha: 14/09/2025 08:58hrs
// Versión: v2.8.1 - Validación de Email Único
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface EmailValidationProps {
  email: string;
  onValidationChange: (isValid: boolean, message: string) => void;
  className?: string;
}

export const EmailValidation = ({ 
  email, 
  onValidationChange, 
  className = "" 
}: EmailValidationProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isValid: false,
    message: '',
    type: 'info'
  });

  // Debounce para evitar múltiples llamadas
  useEffect(() => {
    if (!email || email.length < 3) {
      setValidationState({
        isValid: false,
        message: '',
        type: 'info'
      });
      onValidationChange(false, '');
      return;
    }

    // Validación básica de formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationState({
        isValid: false,
        message: 'Formato de email inválido',
        type: 'error'
      });
      onValidationChange(false, 'Formato de email inválido');
      return;
    }

    const timeoutId = setTimeout(() => {
      checkEmailUniqueness(email);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email, onValidationChange]);

  const checkEmailUniqueness = async (emailToCheck: string) => {
    setIsChecking(true);
    
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        setValidationState({
          isValid: false,
          message: 'Error de conexión',
          type: 'error'
        });
        onValidationChange(false, 'Error de conexión');
        setIsChecking(false);
        return;
      }

      // Verificar en auth.users (tabla de Supabase Auth)
      const { data: authData, error: authError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', emailToCheck.toLowerCase())
        .limit(1);

      if (authError) {
        logger.error('Error checking email:', authError);
        setValidationState({
          isValid: false,
          message: 'Error al verificar email',
          type: 'error'
        });
        onValidationChange(false, 'Error al verificar email');
        return;
      }

      if (authData && authData.length > 0) {
        setValidationState({
          isValid: false,
          message: 'Este email ya está registrado',
          type: 'error'
        });
        onValidationChange(false, 'Este email ya está registrado');
      } else {
        setValidationState({
          isValid: true,
          message: 'Email disponible',
          type: 'success'
        });
        onValidationChange(true, 'Email disponible');
      }

    } catch (error) {
      logger.error('Error validating email:', { error: error instanceof Error ? error.message : String(error) });
      setValidationState({
        isValid: false,
        message: 'Error de conexión',
        type: 'error'
      });
      onValidationChange(false, 'Error de conexión');
    } finally {
      setIsChecking(false);
    }
  };

  if (!email || email.length < 3) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 mt-1 ${className}`}>
      {isChecking ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-blue-600">Verificando...</span>
        </>
      ) : (
        <>
          {validationState.type === 'success' && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">{validationState.message}</span>
            </>
          )}
          {validationState.type === 'error' && (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">{validationState.message}</span>
            </>
          )}
        </>
      )}
    </div>
  );
};

// Hook para usar validación de email
export const useEmailValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  
  const validateEmailUniqueness = async (email: string): Promise<{
    isValid: boolean;
    message: string;
  }> => {
    setIsValidating(true);
    
    try {
      if (!email || email.length < 3) {
        return { isValid: false, message: 'Email requerido' };
      }

      // Validación de formato
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Formato de email inválido' };
      }

      // Verificar unicidad en Supabase
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return { isValid: false, message: 'Error de conexión' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (error) {
        logger.error('Error checking email:', error);
        return { isValid: false, message: 'Error al verificar email' };
      }

      if (data && data.length > 0) {
        return { isValid: false, message: 'Este email ya está registrado' };
      }

      return { isValid: true, message: 'Email disponible' };

    } catch (error) {
      logger.error('Error validating email:', { error: error instanceof Error ? error.message : String(error) });
      return { isValid: false, message: 'Error de conexión' };
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateEmailUniqueness,
    isValidating
  };
};

export default EmailValidation;
