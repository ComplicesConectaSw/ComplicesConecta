/**
 * PhoneInput - Componente para entrada de número telefónico mexicano
 * Fecha: 15 Noviembre 2025
 * Propósito: Input especializado para teléfonos de México con validación y formato automático
 * Características: Validación 10 dígitos, normalización +52, feedback visual
 */

import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { validateMXPhone, formatMXPhone } from '@/utils/validation';
import { cn } from '@/shared/lib/cn';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (valid: boolean, normalized: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showValidation?: boolean;
  autoFormat?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onValidChange,
  placeholder = '55 1234 5678',
  disabled = false,
  required = false,
  className = '',
  showValidation = true,
  autoFormat = true
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    normalized: string;
    error?: string;
  }>({ valid: false, normalized: '', error: undefined });

  // Validar el valor actual cuando cambie
  useEffect(() => {
    if (value) {
      const result = validateMXPhone(value);
      setValidationResult(result);
      
      // Notificar al padre sobre el cambio de validación
      if (onValidChange) {
        onValidChange(result.valid, result.normalized);
      }
    } else {
      setValidationResult({ valid: false, normalized: '', error: undefined });
      if (onValidChange) {
        onValidChange(false, '');
      }
    }
  }, [value, onValidChange]);

  /**
   * Maneja el cambio de valor en el input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Solo permitir números, espacios, guiones, paréntesis y el símbolo +
    const sanitized = newValue.replace(/[^\d\s\-+()]/g, '');
    
    onChange(sanitized);
  };

  /**
   * Maneja el evento blur para formatear automáticamente
   */
  const handleBlur = () => {
    setIsTouched(true);
    
    // Auto-formatear si está habilitado y el número es válido
    if (autoFormat && value && validationResult.valid) {
      const formatted = formatMXPhone(value);
      onChange(formatted);
    }
  };

  /**
   * Determina el ícono de validación a mostrar
   */
  const getValidationIcon = () => {
    if (!showValidation || !isTouched || !value) {
      return null;
    }

    if (validationResult.valid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  /**
   * Determina el mensaje de ayuda a mostrar
   */
  const getHelpText = () => {
    if (!showValidation || !isTouched || !value) {
      return null;
    }

    if (validationResult.valid) {
      return (
        <p className="text-sm text-green-600 mt-1">
          ✓ Número válido: {validationResult.normalized}
        </p>
      );
    }

    if (validationResult.error) {
      return (
        <p className="text-sm text-red-600 mt-1">
          {validationResult.error}
        </p>
      );
    }

    return null;
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Ícono de teléfono */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>

        {/* Input principal */}
        <Input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'pl-10 pr-10',
            validationResult.valid && isTouched && 'border-green-500 focus:border-green-500',
            !validationResult.valid && isTouched && value && 'border-red-500 focus:border-red-500'
          )}
          maxLength={20}
          inputMode="tel"
          autoComplete="tel"
        />

        {/* Ícono de validación */}
        {getValidationIcon() && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Mensaje de ayuda/error */}
      {getHelpText()}

      {/* Ayuda adicional si no se ha tocado el input */}
      {!isTouched && !value && (
        <p className="text-xs text-gray-500 mt-1">
          Ingresa 10 dígitos (código de área + número)
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
