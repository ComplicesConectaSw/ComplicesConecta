import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
      color: 'text-pink-400'
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
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-red-900/95 backdrop-blur-md border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star className="h-6 w-6 text-yellow-400" />
            Compatibilidad
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 relative">
              <span className="text-2xl font-bold text-white">{compatibilityScore}%</span>
              <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Compatibilidad {getScoreLabel(compatibilityScore)}
            </h3>
            <p className="text-white/80 text-sm">
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
                      <p className="font-medium text-sm">{factor.title}</p>
                      <Badge 
                        variant="secondary" 
                        className={`${getScoreColor(factor.score)} bg-white/10 text-xs`}
                      >
                        {factor.score}%
                      </Badge>
                    </div>
                    <p className="text-xs text-white/70">{factor.description}</p>
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

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="font-medium text-sm">¿Cómo calculamos la compatibilidad?</span>
            </div>
            <p className="text-xs text-white/70">
              Analizamos tus intereses, preferencias, ubicación, edad, tipo de relación buscada y patrones de actividad para encontrar las mejores conexiones.
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompatibilityModal;
