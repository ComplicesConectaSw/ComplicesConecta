import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Zap, Shield, Users, Calendar } from 'lucide-react';

interface VideoCallBetaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoCallBetaModal: React.FC<VideoCallBetaModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Video className="h-6 w-6 text-purple-600" />
            <DialogTitle className="text-xl font-bold">
              Videollamadas HD
            </DialogTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Beta
            </Badge>
          </div>
          <DialogDescription className="text-left space-y-4">
            <p className="text-gray-600">
              Las videollamadas de alta calidad están en desarrollo y estarán disponibles después del lanzamiento beta.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Características próximas:
              </h4>
              
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-green-500" />
                  Videollamadas encriptadas end-to-end
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-blue-500" />
                  Llamadas grupales hasta 4 personas
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-purple-500" />
                  Programación de videocitas
                </li>
                <li className="flex items-center gap-2">
                  <Video className="h-3 w-3 text-pink-500" />
                  Calidad HD con filtros de belleza
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border">
              <p className="text-sm text-purple-700 font-medium">
                💡 Mientras tanto, puedes usar el chat de texto para conectar con otros usuarios.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} className="flex-1">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
