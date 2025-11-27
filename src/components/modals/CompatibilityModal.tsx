import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Target, Brain, Star, Zap } from 'lucide-react';

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  compatibilityScore?: number;
}

const CompatibilityModal: React.FC<CompatibilityModalProps> = ({ 
  isOpen, 
  onClose, 
  compatibilityScore = 85 
}) => {
  const compatibilityFactors = [
    {
      icon: Heart,
      title: 'Intereses Lifestyle',
      description: 'Compatibilidad en preferencias swinger y experiencias',
      score: 92,
      color: 'text-purple-400'
    },
    {
      icon: Users,
      title: 'Tipo de Relación',
      description: 'Alineación en búsqueda de parejas o singles',
      score: 88,
      color: 'text-purple-400'
    },
    {
      icon: Target,
      title: 'Objetivos Comunes',
      description: 'Coincidencia en expectativas y metas',
      score: 79,
      color: 'text-blue-400'
    },
    {
      icon: Brain,
      title: 'Personalidad',
      description: 'Compatibilidad psicológica y de comunicación',
      score: 83,
      color: 'text-green-400'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 75) return 'Muy Buena';
    if (score >= 60) return 'Buena';
    return 'Regular';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 backdrop-blur-md border-purple-500/30 text-white z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-lg">
            <Star className="h-6 w-6 text-yellow-400" />
            Compatibilidad
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 relative shadow-lg shadow-purple-500/50">
              <span className="text-2xl font-bold text-white drop-shadow-lg">{compatibilityScore}%</span>
              <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg">
              Compatibilidad {getScoreLabel(compatibilityScore)}
            </h3>
            <p className="text-white font-medium text-sm drop-shadow-md">
              Nuestro algoritmo analiza múltiples factores para calcular tu compatibilidad con otros perfiles.
            </p>
          </div>

          <div className="space-y-3">
            {compatibilityFactors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <Icon className={`h-5 w-5 ${factor.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-white drop-shadow-md">{factor.title}</p>
                      <Badge 
                        variant="secondary" 
                        className={`${getScoreColor(factor.score).replace('text-', 'text-white ')} bg-white/20 border-white/30 text-xs font-medium`}
                      >
                        {factor.score}%
                      </Badge>
                    </div>
                    <p className="text-xs text-white/90 font-medium drop-shadow-sm">{factor.description}</p>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                      <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${
                          factor.score >= 90 ? 'from-green-400 to-green-500' :
                          factor.score >= 75 ? 'from-yellow-400 to-yellow-500' :
                          factor.score >= 60 ? 'from-orange-400 to-orange-500' :
                          'from-red-400 to-red-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="font-bold text-sm text-white drop-shadow-md">¿Cómo calculamos la compatibilidad?</span>
            </div>
            <p className="text-xs text-white/90 font-medium drop-shadow-sm">
              Analizamos tus intereses, preferencias, ubicación, edad, tipo de relación buscada y patrones de actividad para encontrar las mejores conexiones.
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/30"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompatibilityModal;
