import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Crown, Flame, MessageCircle, Eye, Calendar, Zap, Check } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubscribe 
}) => {
  const premiumFeatures = [
    {
      icon: Flame,
      title: 'Super Likes Ilimitados',
      description: 'Destaca sin límites con todos los perfiles que te interesen',
      color: 'text-orange-400'
    },
    {
      icon: MessageCircle,
      title: 'Chat Prioritario',
      description: 'Tus mensajes aparecen primero en las conversaciones',
      color: 'text-blue-400'
    },
    {
      icon: Eye,
      title: 'Ver Quién Te Visitó',
      description: 'Descubre quién ha visto tu perfil y cuándo',
      color: 'text-purple-400'
    },
    {
      icon: Calendar,
      title: 'Eventos VIP Exclusivos',
      description: 'Acceso a fiestas privadas y encuentros premium',
      color: 'text-yellow-400'
    },
    {
      icon: Zap,
      title: 'Matching Avanzado',
      description: 'Algoritmo premium con compatibilidad mejorada',
      color: 'text-green-400'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 backdrop-blur-md border-purple-500/30 text-white z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-lg">
            <Crown className="h-6 w-6 text-yellow-400" />
            ComplicesConecta Premium
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/50">
              <Crown className="h-8 w-8 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg">
              Desbloquea el poder completo
            </h3>
            <p className="text-white font-medium text-sm drop-shadow-md">
              Accede a funciones exclusivas y vive experiencias únicas en la comunidad swinger más premium.
            </p>
          </div>

          <div className="space-y-3">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                  <Icon className={`h-5 w-5 ${feature.color} mt-0.5`} />
                  <div className="flex-1">
                    <p className="font-bold text-white drop-shadow-md">{feature.title}</p>
                    <p className="text-xs text-white/90 font-medium drop-shadow-sm">{feature.description}</p>
                  </div>
                  <Check className="h-4 w-4 text-green-400" />
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white drop-shadow-md">Precio especial de lanzamiento</span>
              <Badge variant="secondary" className="bg-yellow-500/30 text-yellow-300 border-yellow-400/50 font-medium">
                -50% OFF
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white drop-shadow-lg">$299</span>
              <span className="text-sm text-white/70 line-through font-medium">$599</span>
              <span className="text-sm text-white font-medium drop-shadow-sm">/ mes</span>
            </div>
            <p className="text-xs text-white/90 font-medium mt-1 drop-shadow-sm">
              Cancela cuando quieras • Sin compromisos
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Tal vez después
            </Button>
            {onSubscribe && (
              <Button
                onClick={onSubscribe}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                <Crown className="h-4 w-4 mr-2" />
                Ser Premium
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
