import React, { useState } from 'react';
import { X, AlertTriangle, Shield, User, CreditCard, Baby, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { profileReportService } from '@/features/profile/ProfileReportService';
import { toast } from 'sonner';

interface ProfileReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
}

type ReportReasonId =
  | 'harassment'
  | 'impersonation'
  | 'fake-profile'
  | 'fraud'
  | 'underage'
  | 'other';

const REPORT_REASONS: {
  id: ReportReasonId;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: 'harassment', label: 'Acoso o intimidación', description: 'Comportamiento agresivo, amenazas o acoso', icon: AlertTriangle, color: 'text-red-500' },
  { id: 'impersonation', label: 'Suplantación de identidad', description: 'Se hace pasar por otra persona', icon: User, color: 'text-orange-500' },
  { id: 'fake-profile', label: 'Perfil falso o información engañosa', description: 'Información falsa o perfil ficticio', icon: Shield, color: 'text-yellow-500' },
  { id: 'fraud', label: 'Fraude o estafa', description: 'Actividad fraudulenta o estafa', icon: CreditCard, color: 'text-purple-500' },
  { id: 'underage', label: 'Menor de edad', description: 'Usuario menor de 18 años', icon: Baby, color: 'text-pink-500' },
  { id: 'other', label: 'Otro motivo', description: 'Otra violación de las normas', icon: Flag, color: 'text-gray-500' }
];

export const ProfileReportModal: React.FC<ProfileReportModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReasonId | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'reason' | 'details' | 'confirmation'>('reason');

  const handleReasonSelect = (reasonId: ReportReasonId) => {
    setSelectedReason(reasonId);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Por favor selecciona un motivo');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await profileReportService.createProfileReport({
        reportedUserId,
        reason: selectedReason,
        description: description.trim() || undefined
      });

      if (result.success) {
        setStep('confirmation');
        toast.success('Reporte enviado correctamente');
        setTimeout(() => {
          onClose();
          resetModal();
        }, 3000);
      } else {
        toast.error(result.error || 'Error al enviar el reporte');
      }
    } catch {
      toast.error('Error interno del servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setSelectedReason('');
    setDescription('');
    setStep('reason');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const selectedReasonData = REPORT_REASONS.find(r => r.id === selectedReason);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reportar Perfil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reportedUserName}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'reason' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">¿Por qué estás reportando este perfil?</p>
                  {REPORT_REASONS.map(reason => (
                    <button
                      key={reason.id}
                      onClick={() => handleReasonSelect(reason.id)}
                      className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                      <div className="flex items-start space-x-3">
                        {React.createElement(reason.icon, { className: `w-5 h-5 mt-0.5 ${reason.color} group-hover:scale-110 transition-transform` })}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{reason.label}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reason.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {step === 'details' && selectedReasonData && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {React.createElement(selectedReasonData.icon, { className: `w-5 h-5 ${selectedReasonData.color}` })}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{selectedReasonData.label}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedReasonData.description}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detalles adicionales (opcional)</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Proporciona más detalles sobre el problema..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description.length}/500 caracteres</p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep('reason')}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Enviar Reporte'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'confirmation' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reporte Enviado</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Gracias por ayudarnos a mantener la comunidad segura. Revisaremos tu reporte lo antes posible.</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Esta ventana se cerrará automáticamente...</div>
                </motion.div>
              )}
            </div>

            {/* Warning Footer */}
            {step !== 'confirmation' && (
              <div className="px-6 pb-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Los reportes falsos pueden resultar en la suspensión de tu cuenta. 
                      Solo reporta contenido que realmente viole nuestras normas.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
