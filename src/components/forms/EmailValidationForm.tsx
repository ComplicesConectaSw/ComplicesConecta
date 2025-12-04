/**
 * Formulario con validación de email único - ComplicesConecta
 * Integra React Hook Form + Zod + validación en tiempo real
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validateUniqueEmail, validateEmailFormat } from '@/utils/validation';
import { logger } from '@/lib/logger';

// Schema de validación con Zod
const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .refine(
      async (email) => {
        if (!validateEmailFormat(email)) return false;
        return await validateUniqueEmail(email);
      },
      {
        message: 'Este email ya está registrado'
      }
    ),
  confirmEmail: z.string().min(1, 'Confirma tu email')
}).refine((data) => data.email === data.confirmEmail, {
  message: 'Los emails no coinciden',
  path: ['confirmEmail']
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailValidationFormProps {
  onValidEmail: (email: string) => void;
  onError?: (error: string) => void;
  initialEmail?: string;
  disabled?: boolean;
  showConfirmation?: boolean;
}

export const EmailValidationForm: React.FC<EmailValidationFormProps> = ({
  onValidEmail,
  onError,
  initialEmail = '',
  disabled = false,
  showConfirmation = true
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: initialEmail,
      confirmEmail: initialEmail
    },
    mode: 'onChange'
  });

  const emailValue = watch('email');

  // Validación en tiempo real del email
  React.useEffect(() => {
    const validateEmailAsync = async () => {
      if (!emailValue || emailValue.length < 3) {
        setValidationStatus('idle');
        return;
      }

      if (!validateEmailFormat(emailValue)) {
        setValidationStatus('invalid');
        return;
      }

      setIsValidating(true);
      
      try {
        const isUnique = await validateUniqueEmail(emailValue);
        setValidationStatus(isUnique ? 'valid' : 'invalid');
        
        if (!isUnique) {
          setError('email', {
            type: 'manual',
            message: 'Este email ya está registrado'
          });
        } else {
          clearErrors('email');
        }
      } catch (error) {
        logger.error('Error validating email:', { error: error instanceof Error ? error.message : String(error) });
        setValidationStatus('invalid');
        setError('email', {
          type: 'manual',
          message: 'Error al validar el email'
        });
      } finally {
        setIsValidating(false);
      }
    };

    const debounceTimer = setTimeout(validateEmailAsync, 500);
    return () => clearTimeout(debounceTimer);
  }, [emailValue, setError, clearErrors]);

  const onSubmit = async (data: EmailFormData) => {
    try {
      // Validación final antes de enviar
      const isUnique = await validateUniqueEmail(data.email);
      
      if (!isUnique) {
        setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado'
        });
        onError?.('Email ya registrado');
        return;
      }

      onValidEmail(data.email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al validar email';
      logger.error('Error in email form submission:', { error: errorMessage });
      onError?.(errorMessage);
    }
  };

  const getEmailInputStatus = () => {
    if (isValidating) return 'validating';
    if (errors.email) return 'error';
    if (validationStatus === 'valid') return 'valid';
    if (validationStatus === 'invalid') return 'invalid';
    return 'default';
  };

  const getEmailInputIcon = () => {
    const status = getEmailInputStatus();
    switch (status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getEmailInputClasses = () => {
    const status = getEmailInputStatus();
    const baseClasses = 'pr-10';
    
    switch (status) {
      case 'valid':
        return `${baseClasses} border-green-500 focus:border-green-500`;
      case 'error':
      case 'invalid':
        return `${baseClasses} border-red-500 focus:border-red-500`;
      case 'validating':
        return `${baseClasses} border-blue-500 focus:border-blue-500`;
      default:
        return baseClasses;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email *
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            disabled={disabled}
            className={getEmailInputClasses()}
            {...register('email')}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {getEmailInputIcon()}
          </div>
        </div>
        {errors.email && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.email.message}</AlertDescription>
          </Alert>
        )}
        {validationStatus === 'valid' && !errors.email && (
          <Alert className="border-green-500 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Email disponible ✓</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Campo Confirmar Email */}
      {showConfirmation && (
        <div className="space-y-2">
          <Label htmlFor="confirmEmail">
            Confirmar Email *
          </Label>
          <Input
            id="confirmEmail"
            type="email"
            placeholder="Confirma tu email"
            disabled={disabled}
            className={errors.confirmEmail ? 'border-red-500 focus:border-red-500' : ''}
            {...register('confirmEmail')}
          />
          {errors.confirmEmail && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.confirmEmail.message}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>• El email debe ser válido y único en la plataforma</p>
        <p>• Se enviará un código de verificación a este email</p>
        <p>• Asegúrate de tener acceso a esta cuenta</p>
      </div>

      {/* Botón Submit */}
      <Button
        type="submit"
        disabled={
          disabled || 
          isSubmitting || 
          isValidating || 
          validationStatus !== 'valid' ||
          Object.keys(errors).length > 0
        }
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Validando...
          </>
        ) : (
          'Continuar con este Email'
        )}
      </Button>
    </form>
  );
};

