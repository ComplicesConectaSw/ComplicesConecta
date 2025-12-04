/**
 * Modal de Términos y Políticas de Privacidad
 * Componente reutilizable para mostrar términos con checkbox obligatorio
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, FileText, Shield } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (termsAccepted: boolean, privacyAccepted: boolean) => void;
  title?: string;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  title = "Términos de Uso y Política de Privacidad"
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [showFullPrivacy, setShowFullPrivacy] = useState(false);

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      onAccept(termsAccepted, privacyAccepted);
      onClose();
    }
  };

  const handleClose = () => {
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setShowFullTerms(false);
    setShowFullPrivacy(false);
    onClose();
  };

  const canProceed = termsAccepted && privacyAccepted;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Resumen de Términos de Uso */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Términos de Uso - Resumen
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullTerms(!showFullTerms)}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {showFullTerms ? 'Ocultar' : 'Ver completo'}
                </Button>
              </div>
              
              {!showFullTerms ? (
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• <strong>Edad mínima:</strong> Debes ser mayor de 18 años para usar ComplicesConecta</p>
                  <p>• <strong>Uso responsable:</strong> Prohibido contenido ofensivo, spam o acoso</p>
                  <p>• <strong>Veracidad:</strong> La información del perfil debe ser real y actualizada</p>
                  <p>• <strong>Respeto:</strong> Trata a otros usuarios con cortesía y respeto</p>
                  <p>• <strong>Seguridad:</strong> No compartas información personal sensible</p>
                </div>
              ) : (
                <div className="text-sm text-gray-700 space-y-3 max-h-40 overflow-y-auto">
                  <h4 className="font-medium">1. Aceptación de Términos</h4>
                  <p>Al registrarte en ComplicesConecta, aceptas cumplir con estos términos de uso y todas las políticas aplicables.</p>
                  
                  <h4 className="font-medium">2. Elegibilidad</h4>
                  <p>Debes tener al menos 18 años de edad para crear una cuenta. Si eres menor de edad, no puedes usar este servicio.</p>
                  
                  <h4 className="font-medium">3. Conducta del Usuario</h4>
                  <p>Te comprometes a usar la plataforma de manera responsable, sin acosar, amenazar o enviar contenido inapropiado a otros usuarios.</p>
                  
                  <h4 className="font-medium">4. Contenido del Perfil</h4>
                  <p>Toda la información de tu perfil debe ser veraz y actualizada. Las fotos deben ser tuyas y apropiadas.</p>
                  
                  <h4 className="font-medium">5. Privacidad y Seguridad</h4>
                  <p>No compartas información personal como números de teléfono, direcciones o datos financieros con otros usuarios.</p>
                </div>
              )}

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                  He leído y acepto los Términos de Uso
                </label>
              </div>
            </div>

            {/* Resumen de Política de Privacidad */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Política de Privacidad - Resumen
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullPrivacy(!showFullPrivacy)}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {showFullPrivacy ? 'Ocultar' : 'Ver completo'}
                </Button>
              </div>

              {!showFullPrivacy ? (
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• <strong>Datos recopilados:</strong> Información de perfil, fotos, mensajes y actividad</p>
                  <p>• <strong>Uso de datos:</strong> Mejorar el servicio, hacer matches y comunicación</p>
                  <p>• <strong>Compartir datos:</strong> Solo con otros usuarios según tu configuración</p>
                  <p>• <strong>Seguridad:</strong> Encriptación y medidas de protección implementadas</p>
                  <p>• <strong>Tus derechos:</strong> Acceso, corrección y eliminación de tus datos</p>
                </div>
              ) : (
                <div className="text-sm text-gray-700 space-y-3 max-h-40 overflow-y-auto">
                  <h4 className="font-medium">1. Información que Recopilamos</h4>
                  <p>Recopilamos información que nos proporcionas directamente, como datos de perfil, fotos, mensajes y preferencias.</p>
                  
                  <h4 className="font-medium">2. Cómo Usamos tu Información</h4>
                  <p>Usamos tus datos para crear tu perfil, sugerir matches compatibles, facilitar la comunicación y mejorar nuestros servicios.</p>
                  
                  <h4 className="font-medium">3. Compartir Información</h4>
                  <p>Tu información de perfil se comparte con otros usuarios según tu configuración de privacidad. No vendemos tus datos a terceros.</p>
                  
                  <h4 className="font-medium">4. Seguridad de Datos</h4>
                  <p>Implementamos medidas de seguridad técnicas y organizacionales para proteger tu información personal.</p>
                  
                  <h4 className="font-medium">5. Tus Derechos</h4>
                  <p>Puedes acceder, corregir o eliminar tu información personal en cualquier momento desde tu perfil o contactándonos.</p>
                </div>
              )}

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                />
                <label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
                  He leído y acepto la Política de Privacidad
                </label>
              </div>
            </div>

            {/* Mensaje de advertencia si no se han aceptado */}
            {(!termsAccepted || !privacyAccepted) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Debes aceptar tanto los Términos de Uso como la Política de Privacidad para continuar con el registro.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!canProceed}
            className={canProceed ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {canProceed ? 'Acepto y Continúo' : 'Debe aceptar ambos términos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

