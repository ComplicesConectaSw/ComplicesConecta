import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Modal';
import { Heart, X, Zap } from 'lucide-react';

interface ActionButtonsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActionButtonsModal = ({ isOpen, onClose }: ActionButtonsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white border-purple-500/30 max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">¿Qué Hacen los Botones?</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-white/90 font-medium drop-shadow-md">
            Aquí te explicamos cómo interactuar con otros perfiles.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 text-white">
        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-500/30 text-red-300 rounded-full flex items-center justify-center shadow-lg">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white drop-shadow-md">Pasar (X)</h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm">Usa este botón si no te interesa el perfil. No se enviará ninguna notificación y pasarás al siguiente.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/30 text-yellow-300 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white drop-shadow-md">Superlike (Rayo)</h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm">¿Alguien te llamó mucho la atención? Envíale un Superlike para destacarte. ¡La otra persona sabrá que te interesa de verdad!</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/30 text-purple-300 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white drop-shadow-md">Me Gusta (Corazón)</h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm">Si te gusta un perfil, dale 'Me Gusta'. Si la otra persona también te da 'Me Gusta', ¡es un match! Podrán empezar a chatear.</p>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
