import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, Crown } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  feature?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  title,
  description = "Esta funcionalidad estará disponible después de la fase Beta.",
  feature = "Premium"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-red-900/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Crown className="h-12 w-12 text-yellow-400 animate-pulse" />
              <Sparkles className="h-6 w-6 text-pink-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <DialogTitle className="text-center text-white text-xl font-bold">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Próximamente
          </Badge>
          
          <p className="text-white/80 text-sm leading-relaxed">
            {description}
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-white/70 text-xs">
              🚀 Estamos trabajando en funciones {feature} increíbles que estarán disponibles 
              una vez que ComplicesConecta complete su fase Beta.
            </p>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
