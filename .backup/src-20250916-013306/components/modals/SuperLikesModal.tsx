import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-red-900/95 backdrop-blur-md border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flame className="h-6 w-6 text-orange-500" />
            Super Likes
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              ¡Destaca entre la multitud!
            </h3>
            <p className="text-white/80 text-sm">
              Los Super Likes te permiten mostrar interés especial y aparecer primero en la lista de la otra persona.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <Star className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="font-medium">Prioridad máxima</p>
                <p className="text-xs text-white/70">Apareces primero en su lista</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <Zap className="h-5 w-5 text-blue-400" />
              <div>
                <p className="font-medium">Notificación especial</p>
                <p className="text-xs text-white/70">Reciben una alerta de tu interés</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
              <Heart className="h-5 w-5 text-pink-400" />
              <div>
                <p className="font-medium">3x más matches</p>
                <p className="text-xs text-white/70">Mayor probabilidad de conexión</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Super Likes disponibles</span>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                5 / día
              </Badge>
            </div>
            <p className="text-xs text-white/70">
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
