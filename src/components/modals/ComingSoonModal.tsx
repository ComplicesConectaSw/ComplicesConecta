import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 backdrop-blur-md border-purple-500/30 text-white z-[100]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Crown className="h-12 w-12 text-yellow-400 animate-pulse drop-shadow-lg" />
              <Sparkles className="h-6 w-6 text-blue-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <DialogTitle className="text-center text-white text-xl font-bold drop-shadow-lg">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <Badge variant="outline" className="bg-yellow-500/30 text-yellow-300 border-yellow-400/50 font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Próximamente
          </Badge>
          
          <p className="text-white font-medium text-sm leading-relaxed drop-shadow-md">
            {description}
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
            <p className="text-white/90 text-xs font-medium drop-shadow-sm">
              🚀 Estamos trabajando en funciones {feature} increíbles que estarán disponibles 
              una vez que ComplicesConecta complete su fase Beta.
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

