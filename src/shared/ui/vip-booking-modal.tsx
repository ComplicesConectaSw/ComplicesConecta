import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wine, Shield, Music, Users, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";

interface VipBookingModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const VipBookingModal: React.FC<VipBookingModalProps> = ({ open, onClose, className }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "relative w-full max-w-lg rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-900/90 via-black/90 to-blue-900/90 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8",
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600/40 border border-purple-300/40">
                <Wine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Reserva tu Experiencia VIP
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300">
                  Eventos selectos para parejas y singles verificados. Cupos muy limitados.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6 text-sm text-zinc-200">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 text-purple-300" />
                <div>
                  <p className="font-medium">Seguridad y Discreción</p>
                  <p className="text-xs text-zinc-400">Acceso solo con verificación KYC y perfiles auditados.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Music className="w-4 h-4 mt-0.5 text-purple-300" />
                <div>
                  <p className="font-medium">Experiencias Curadas</p>
                  <p className="text-xs text-zinc-400">Playlists, performances y dinámicas guiadas por hosts expertos.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-purple-300" />
                <div>
                  <p className="font-medium">Parejas Afines</p>
                  <p className="text-xs text-zinc-400">Matching previo según intereses, límites y estilo de relación.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Wine className="w-4 h-4 mt-0.5 text-purple-300" />
                <div>
                  <p className="font-medium">Coctelería Premium</p>
                  <p className="text-xs text-zinc-400">Opciones signature y mocktails incluidos en experiencias VIP.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-300 mb-4">
              <p>
                El equipo de ComplicesConecta confirmará tu reservación por mensaje privado. Nunca
                compartimos datos personales con terceros.
              </p>
              <p className="text-zinc-400">
                Al continuar aceptas nuestro protocolo de consentimiento dinámico y código de conducta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/20 text-zinc-100 hover:bg-white/10"
              >
                Cerrar
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                Solicitar Reservación
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
