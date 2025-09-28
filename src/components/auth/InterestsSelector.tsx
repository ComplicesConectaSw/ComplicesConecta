import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  minRequired?: number;
  className?: string;
  label?: string;
}

// Intereses adaptados al lifestyle swinger (apropiados para registro - no explícitos)
const AVAILABLE_INTERESTS = [
  // Encuentros Swinger
  'Intercambio de parejas',
  'Soft swap',
  'Full swap',
  'Encuentros grupales',
  'Tríos',
  'Fiestas swinger',
  'Clubs swinger',
  'Eventos lifestyle',
  
  // Dinámicas de Pareja
  'Hotwife',
  'Cuckold',
  'Stag/Vixen',
  'Parejas abiertas',
  'Relaciones libres',
  'Poliamor',
  'Swinging ocasional',
  'Lifestyle comprometido',
  
  // Preferencias Sexuales
  'Voyeurismo',
  'Exhibicionismo',
  'BDSM ligero',
  'Juegos de rol',
  'Fantasías compartidas',
  'Experiencias nuevas',
  'Mentalidad abierta',
  'Sin tabúes',
  
  // Comunidad Swinger
  'Networking swinger',
  'Amistad con beneficios',
  'Comunidad lifestyle',
  'Eventos temáticos',
  'Fiestas privadas',
  'Encuentros discretos',
  'Conexiones auténticas',
  'Respeto y consentimiento'
];

export const InterestsSelector: React.FC<InterestsSelectorProps> = ({
  selectedInterests,
  onInterestsChange,
  minRequired = 6,
  className = '',
  label = 'Selecciona tus intereses *'
}) => {
  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const remainingRequired = Math.max(0, minRequired - selectedInterests.length);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-white">{label}</Label>
        <div className="text-sm text-white/70">
          {selectedInterests.length} seleccionados
          {remainingRequired > 0 && (
            <span className="text-yellow-400 ml-2">
              (faltan {remainingRequired})
            </span>
          )}
        </div>
      </div>
      
      {remainingRequired > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <div className="text-yellow-300 text-sm">
            ⚠️ Selecciona al menos {minRequired} intereses para continuar
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-white/5 rounded-lg border border-white/10">
        {AVAILABLE_INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <Badge
              key={interest}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 text-center justify-center py-2 px-3 ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent hover:from-pink-600 hover:to-purple-600'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
              }`}
              onClick={() => handleInterestToggle(interest)}
            >
              {interest}
            </Badge>
          );
        })}
      </div>

      {selectedInterests.length >= minRequired && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
          ✅ Perfecto! Has seleccionado suficientes intereses
        </div>
      )}
    </div>
  );
};
