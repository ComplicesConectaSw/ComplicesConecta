import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface NicknameValidatorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean, isAvailable: boolean) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

interface ValidationState {
  isChecking: boolean;
  isValid: boolean;
  isAvailable: boolean;
  message: string;
  suggestions: string[];
}

export const NicknameValidator: React.FC<NicknameValidatorProps> = ({
  value,
  onChange,
  onValidationChange,
  className = '',
  label = 'Apodo/Nickname *',
  placeholder = 'Tu apodo único',
  required = true
}) => {
  const [validation, setValidation] = useState<ValidationState>({
    isChecking: false,
    isValid: false,
    isAvailable: false,
    message: '',
    suggestions: []
  });

  // Validar formato del nickname
  const validateFormat = (nickname: string): { isValid: boolean; message: string } => {
    if (!nickname.trim()) {
      return { isValid: false, message: 'El apodo es obligatorio' };
    }

    if (nickname.length < 3) {
      return { isValid: false, message: 'El apodo debe tener al menos 3 caracteres' };
    }

    if (nickname.length > 20) {
      return { isValid: false, message: 'El apodo no puede tener más de 20 caracteres' };
    }

    // Solo letras, números, guiones y guiones bajos
    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      return { isValid: false, message: 'Solo se permiten letras, números, guiones y guiones bajos' };
    }

    // No puede empezar o terminar con guión o guión bajo
    if (/^[-_]|[-_]$/.test(nickname)) {
      return { isValid: false, message: 'No puede empezar o terminar con guión o guión bajo' };
    }

    return { isValid: true, message: 'Formato válido' };
  };

  // Generar sugerencias de apodos alternativos
  const generateSuggestions = (baseNickname: string): string[] => {
    const base = baseNickname.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const suggestions = [
      `${base}_01`,
      `${base}_mx`,
      `${base}123`,
      `${base}_sw`,
      `${base}_2024`,
      `${base}_cc`
    ];
    
    return suggestions.slice(0, 3); // Solo mostrar 3 sugerencias
  };

  // Verificar disponibilidad en base de datos
  const checkAvailability = useCallback(async (nickname: string) => {
    if (!nickname.trim()) return;

    const formatValidation = validateFormat(nickname);
    if (!formatValidation.isValid) {
      setValidation(prev => ({
        ...prev,
        isChecking: false,
        isValid: false,
        isAvailable: false,
        message: formatValidation.message,
        suggestions: []
      }));
      onValidationChange(false, false);
      return;
    }

    setValidation(prev => ({ ...prev, isChecking: true }));

    try {
      // Verificar en tabla profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .ilike('nickname', nickname.trim())
        .limit(1);

      if (error) {
        console.error('Error checking nickname availability:', error);
        setValidation(prev => ({
          ...prev,
          isChecking: false,
          isValid: true,
          isAvailable: false,
          message: 'Error al verificar disponibilidad',
          suggestions: []
        }));
        onValidationChange(true, false);
        return;
      }

      const isAvailable = !data || data.length === 0;

      if (isAvailable) {
        setValidation(prev => ({
          ...prev,
          isChecking: false,
          isValid: true,
          isAvailable: true,
          message: '✅ Apodo disponible',
          suggestions: []
        }));
        onValidationChange(true, true);
      } else {
        const suggestions = generateSuggestions(nickname);
        setValidation(prev => ({
          ...prev,
          isChecking: false,
          isValid: true,
          isAvailable: false,
          message: '❌ Este apodo ya está en uso',
          suggestions
        }));
        onValidationChange(true, false);
      }
    } catch (error) {
      console.error('Error checking nickname:', error);
      setValidation(prev => ({
        ...prev,
        isChecking: false,
        isValid: true,
        isAvailable: false,
        message: 'Error al verificar disponibilidad',
        suggestions: []
      }));
      onValidationChange(true, false);
    }
  }, [onValidationChange]);

  // Debounce para evitar muchas consultas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        checkAvailability(value.trim());
      } else {
        setValidation({
          isChecking: false,
          isValid: false,
          isAvailable: false,
          message: '',
          suggestions: []
        });
        onValidationChange(false, false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, checkAvailability, onValidationChange]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
  };

  const getInputBorderColor = () => {
    if (!value.trim()) return 'border-white/20';
    if (validation.isChecking) return 'border-yellow-400';
    if (validation.isValid && validation.isAvailable) return 'border-green-400';
    if (!validation.isValid || !validation.isAvailable) return 'border-red-400';
    return 'border-white/20';
  };

  return (
    <div className={className}>
      <Label className="text-white">{label}</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-white/10 text-white placeholder:text-white/50 ${getInputBorderColor()}`}
          placeholder={placeholder}
          required={required}
        />
        
        {/* Indicador de estado */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validation.isChecking && (
            <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
          )}
          {!validation.isChecking && validation.isValid && validation.isAvailable && (
            <Check className="h-4 w-4 text-green-400" />
          )}
          {!validation.isChecking && (!validation.isValid || !validation.isAvailable) && value.trim() && (
            <X className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>

      {/* Mensaje de validación */}
      {validation.message && (
        <div className={`mt-2 text-sm ${
          validation.isValid && validation.isAvailable 
            ? 'text-green-400' 
            : 'text-red-400'
        }`}>
          {validation.message}
        </div>
      )}

      {/* Sugerencias */}
      {validation.suggestions.length > 0 && (
        <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-sm text-white/80 mb-2">
            Prueba con estas alternativas:
          </div>
          <div className="flex flex-wrap gap-2">
            {validation.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

