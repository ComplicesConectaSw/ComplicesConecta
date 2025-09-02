import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, X, Zap } from 'lucide-react';

interface ActionButtonsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActionButtonsModal = ({ isOpen, onClose }: ActionButtonsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card-gradient text-white border-slate-800">
        <DialogHeader>
          <DialogTitle>¿Qué Hacen los Botones?</DialogTitle>
          <DialogDescription>
            Aquí te explicamos cómo interactuar con otros perfiles.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 text-white">
        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center">
            <X className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Pasar (X)</h3>
            <p className="text-sm text-white/80">Usa este botón si no te interesa el perfil. No se enviará ninguna notificación y pasarás al siguiente.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Superlike (Rayo)</h3>
            <p className="text-sm text-white/80">¿Alguien te llamó mucho la atención? Envíale un Superlike para destacarte. ¡La otra persona sabrá que te interesa de verdad!</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Me Gusta (Corazón)</h3>
            <p className="text-sm text-white/80">Si te gusta un perfil, dale 'Me Gusta'. Si la otra persona también te da 'Me Gusta', ¡es un match! Podrán empezar a chatear.</p>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
