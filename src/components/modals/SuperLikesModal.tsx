import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Crown, Zap, Heart } from 'lucide-react';

interface SuperLikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

const SuperLikesModal: React.FC<SuperLikesModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 backdrop-blur-md border-purple-500/30 text-white z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-lg">
            <Flame className="h-6 w-6 text-orange-500" />
            Super Likes
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/50">
              <Flame className="h-8 w-8 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white drop-shadow-lg">
              ¡Destaca entre la multitud!
            </h3>
            <p className="text-white font-medium text-sm drop-shadow-md">
              Los Super Likes te permiten mostrar interés especial y aparecer primero en la lista de la otra persona.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <Star className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="font-bold text-white drop-shadow-md">Prioridad máxima</p>
                <p className="text-xs text-white/90 font-medium drop-shadow-sm">Apareces primero en su lista</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <Zap className="h-5 w-5 text-blue-400" />
              <div>
                <p className="font-bold text-white drop-shadow-md">Notificación especial</p>
                <p className="text-xs text-white/90 font-medium drop-shadow-sm">Reciben una alerta de tu interés</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <Heart className="h-5 w-5 text-purple-400" />
              <div>
                <p className="font-bold text-white drop-shadow-md">3x más matches</p>
                <p className="text-xs text-white/90 font-medium drop-shadow-sm">Mayor probabilidad de conexión</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white drop-shadow-md">Super Likes disponibles</span>
              <Badge variant="secondary" className="bg-orange-500/30 text-orange-300 border-orange-400/50 font-medium">
                5 / día
              </Badge>
            </div>
            <p className="text-xs text-white/90 font-medium drop-shadow-sm">
              Los usuarios Premium obtienen Super Likes ilimitados
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Entendido
            </Button>
            {onUpgrade && (
              <Button
                onClick={onUpgrade}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
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

export default SuperLikesModal;
