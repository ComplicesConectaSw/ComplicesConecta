import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Lock } from 'lucide-react';
import { EXPLICIT_INTERESTS } from '@/lib/lifestyle-interests';

interface ExplicitInterestsEditorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  onSave?: () => void;
  className?: string;
}

/**
 * Componente para editar intereses explícitos post-registro
 * Solo accesible después de completar el registro
 * Los intereses explícitos son privados y solo visibles para matches confirmados
 */
export const ExplicitInterestsEditor: React.FC<ExplicitInterestsEditorProps> = ({
  selectedInterests,
  onInterestsChange,
  onSave,
  className = ''
}) => {
  const [hasChanges, setHasChanges] = useState(false);

  const handleInterestToggle = (interest: string) => {
    let newInterests: string[];
    
    if (selectedInterests.includes(interest)) {
      newInterests = selectedInterests.filter(i => i !== interest);
    } else {
      newInterests = [...selectedInterests, interest];
    }
    
    onInterestsChange(newInterests);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    setHasChanges(false);
  };

  return (
    <Card className={`${className} shadow-soft`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-500" />
          Intereses Explícitos (Privados)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Advertencia de Privacidad */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
                ⚠️ Información Privada y Segura
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Estos intereses son completamente privados y <strong>solo se comparten con matches confirmados</strong>. 
                No aparecen en tu perfil público y están protegidos por nuestras políticas de privacidad.
              </p>
            </div>
          </div>
        </div>

        {/* Contador de Intereses */}
        <div className="flex items-center justify-between">
          <Label className="text-gray-700 dark:text-gray-300">
            Selecciona intereses más explícitos (opcional)
          </Label>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedInterests.length} seleccionados
          </div>
        </div>

        {/* Grid de Intereses Explícitos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-72 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {EXPLICIT_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <Badge
                key={interest}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 text-center justify-center py-2 px-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent hover:from-purple-600 hover:to-pink-600 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500'
                }`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </Badge>
            );
          })}
        </div>

        {/* Información Adicional */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>💡 Tip:</strong> Agregar intereses explícitos te ayuda a encontrar matches más compatibles 
            con tus preferencias específicas. Puedes agregar o quitar intereses en cualquier momento.
          </p>
        </div>

        {/* Botón de Guardar */}
        {hasChanges && onSave && (
          <div className="flex justify-end pt-2">
            <Button 
              variant="love" 
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Guardar Cambios
            </Button>
          </div>
        )}

        {/* Estadísticas */}
        {selectedInterests.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Has seleccionado <span className="font-semibold text-purple-600 dark:text-purple-400">
                {selectedInterests.length}
              </span> interés{selectedInterests.length !== 1 ? 'es' : ''} explícito{selectedInterests.length !== 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


