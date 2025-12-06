import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  accepted
}) => {
  const handleAcceptChange = (checked: boolean) => {
    onAccept(checked);
  };

  const handleViewFullTerms = () => {
    window.open('/terms', '_blank');
  };

  return (
    <>
    {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <div
            className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 rounded-2xl shadow-2xl border border-purple-500/40 max-w-xl md:max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 transform transition-all duration-300 ease-out"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-blue-900/95 border-b border-purple-500/40 p-6 rounded-t-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-500/40">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Términos y Condiciones
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Plataforma +18 - Contenido para adultos
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-transparent border-none px-2 py-1 text-sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Advertencia +18 */}
              <div className="bg-gradient-to-r from-red-500/20 via-red-600/15 to-orange-500/20 dark:from-red-900/40 dark:via-red-800/40 dark:to-orange-800/40 rounded-xl p-6 border border-red-400/40 dark:border-red-700/60">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      ⚠️ Contenido Exclusivo +18 Años
                    </h3>
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      Esta plataforma contiene contenido para adultos y está destinada exclusivamente 
                      a personas mayores de 18 años. Al registrarte, confirmas que tienes la edad legal 
                      para acceder a este tipo de contenido en tu jurisdicción.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen de Términos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Resumen de Términos Principales
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Edad Mínima</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Debes ser mayor de 18 años para usar la plataforma
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Contenido Apropiado</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Prohibido contenido ilegal, abusivo o no consensual
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Privacidad</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Tus datos están protegidos según nuestra política
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Respeto Mutuo</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Mantén un ambiente respetuoso con todos los usuarios
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Verificación</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Proceso de verificación para mayor seguridad
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Responsabilidad</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Eres responsable de tu comportamiento en la plataforma
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Políticas Adicionales */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📋 Políticas Incluidas
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   <div className="text-blue-900 dark:text-blue-100">• Política de Privacidad</div>
                  <div className="text-blue-900 dark:text-blue-100">• Política de Cookies</div>
                  <div className="text-blue-900 dark:text-blue-100">• Normas de Comunidad</div>
                  <div className="text-blue-900 dark:text-blue-100">• Política de Contenido</div>
                </div>
              </div>

              {/* Botón para ver términos completos */}
              <div className="text-center">
                <Button
                  onClick={handleViewFullTerms}
                  className="border border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 px-2 py-1 rounded"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Términos y Condiciones Completos
                </Button>
              </div>

              {/* Checkbox de aceptación */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={accepted}
                    onCheckedChange={handleAcceptChange}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor="acceptTerms" 
                      className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                    >
                      Acepto los Términos y Condiciones
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Al marcar esta casilla, confirmo que:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 ml-4">
                      <li>• Soy mayor de 18 años</li>
                      <li>• He leído y acepto los términos y condiciones</li>
                      <li>• Acepto las políticas de privacidad y cookies</li>
                      <li>• Entiendo que esta es una plataforma para adultos</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  onClick={onClose}
                  className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={onClose}
                  disabled={!accepted}
                  className={`${
                    accepted 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {accepted ? 'Continuar con el Registro' : 'Debes Aceptar los Términos'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TermsModal;

