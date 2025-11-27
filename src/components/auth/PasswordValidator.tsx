import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordValidatorProps {
  password: string;
  className?: string;
}

interface ValidationRule {
  id: string;
  label: string;
  isValid: (password: string) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    id: 'length',
    label: 'Mínimo 8 caracteres',
    isValid: (password) => password.length >= 8
  },
  {
    id: 'uppercase',
    label: 'Al menos 1 mayúscula',
    isValid: (password) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'Al menos 1 minúscula',
    isValid: (password) => /[a-z]/.test(password)
  },
  {
    id: 'number',
    label: 'Al menos 1 número',
    isValid: (password) => /\d/.test(password)
  },
  {
    id: 'special',
    label: 'Al menos 1 carácter especial (!@#$%^&*)',
    isValid: (password) => /[!@#$%^&*(),.?":{}|<>[\]/\\]/.test(password)
  }
];

export const PasswordValidator: React.FC<PasswordValidatorProps> = ({ 
  password, 
  className = '' 
}) => {
  if (!password) return null;

  const allValid = validationRules.every(rule => rule.isValid(password));

  return (
    <div className={`mt-2 space-y-1 ${className}`}>
      <div className="text-sm font-medium text-white/90 mb-2">
        Requisitos de contraseña:
      </div>
      {validationRules.map((rule) => {
        const isValid = rule.isValid(password);
        return (
          <div 
            key={rule.id} 
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
              isValid ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isValid ? (
              <Check className="h-4 w-4 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{rule.label}</span>
          </div>
        );
      })}
      {password && (
        <div className={`mt-3 p-2 rounded-md text-sm font-medium ${
          allValid 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {allValid ? '✅ Contraseña válida' : '❌ Completa todos los requisitos'}
        </div>
      )}
    </div>
  );
};

export const isPasswordValid = (password: string): boolean => {
  return validationRules.every(rule => rule.isValid(password));
};
