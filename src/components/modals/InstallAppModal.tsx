import { useState } from "react";
import { X, Smartphone, Download, Chrome, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { logger } from '@/lib/logger';
import { isRunningFromAPK, getPlatformInfo } from '@/utils/platformDetection';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal = ({ isOpen, onClose }: InstallAppModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  if (!isOpen) return null;

  // Detectar si se está ejecutando desde APK
  const platformInfo = getPlatformInfo();
  const isAPK = isRunningFromAPK();

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('edg')) return 'edge';
    if (userAgent.includes('opera') || userAgent.includes('opr')) return 'opera';
    return 'chrome'; // default
  };

  const browser = getBrowserInfo();

  const instructions = {
    chrome: [
      "Haz clic en el botón 'Descargar APK' para iniciar la descarga",
      "Ve a la carpeta de Descargas de tu dispositivo",
      "Toca el archivo 'app-release.apk' descargado",
      "Si aparece una advertencia, toca 'Configuración' y habilita 'Instalar aplicaciones desconocidas'",
      "Regresa y toca 'Instalar' para completar la instalación"
    ],
    firefox: [
      "Haz clic en el botón 'Descargar APK' para iniciar la descarga",
      "Firefox mostrará una notificación de descarga completada",
      "Toca la notificación o ve a Descargas",
      "Toca el archivo APK descargado",
      "Permite la instalación desde fuentes desconocidas si se solicita"
    ],
    opera: [
      "Haz clic en el botón 'Descargar APK' para iniciar la descarga",
      "Opera guardará el archivo en tu carpeta de Descargas",
      "Abre el administrador de archivos y ve a Descargas",
      "Toca el archivo 'app-release.apk'",
      "Confirma la instalación siguiendo las instrucciones en pantalla"
    ],
    safari: [
      "Haz clic en el botón 'Descargar APK'",
      "Safari descargará el archivo APK",
      "Ve a la app 'Archivos' en tu dispositivo",
      "Busca el archivo en la carpeta de Descargas",
      "Nota: Necesitarás un dispositivo Android para instalar el APK"
    ],
    edge: [
      "Haz clic en el botón 'Descargar APK' para iniciar la descarga",
      "Edge mostrará el progreso de descarga en la parte inferior",
      "Una vez completada, toca el archivo descargado",
      "Permite la instalación desde fuentes desconocidas",
      "Sigue las instrucciones para completar la instalación"
    ]
  };

  const browserNames = {
    chrome: 'Google Chrome',
    firefox: 'Mozilla Firefox', 
    opera: 'Opera',
    safari: 'Safari',
    edge: 'Microsoft Edge'
  };

  const currentInstructions = instructions[browser as keyof typeof instructions] || instructions.chrome;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto shadow-glow animate-slide-down overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="bg-hero-gradient p-4 sm:p-6 text-white text-center rounded-t-lg">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="relative">
                {isAPK ? (
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-400 animate-pulse" />
                ) : (
                  <>
                    <Smartphone className="h-12 w-12 sm:h-16 sm:w-16 animate-bounce" />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                      <Download className="h-4 w-4 sm:h-6 sm:w-6 text-green-400 animate-pulse" />
                    </div>
                  </>
                )}
              </div>
            </div>
            {isAPK ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">¡ComplicesConecta Instalada!</h2>
                <p className="text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">
                  Ya tienes la aplicación instalada y funcionando correctamente
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30 text-xs sm:text-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    APK Instalada
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                    v2.1.2 (stable)
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">¡Instala ComplicesConecta!</h2>
                <p className="text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">
                  Sigue estos pasos para instalar nuestra app en tu dispositivo Android
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                    <Globe className="h-3 w-3 mr-1" />
                    {browserNames[browser as keyof typeof browserNames]}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30 text-xs sm:text-sm">
                    v2.1.2 (stable)
                  </Badge>
                </div>
              </>
            )}
          </div>
          
          <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
            {isAPK ? (
              <div className="space-y-4 text-center">
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">¡Aplicación Instalada!</h3>
                  </div>
                  <p className="text-sm text-green-100 mb-3">
                    ComplicesConecta está funcionando correctamente en tu dispositivo Android.
                  </p>
                  <div className="space-y-2 text-xs text-green-200">
                    <p>✅ Versión instalada: v2.1.2</p>
                    <p>✅ Plataforma: Android APK</p>
                    <p>✅ Estado: Funcionando correctamente</p>
                  </div>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Información del Dispositivo:</h4>
                  <div className="space-y-1 text-xs text-blue-100">
                    <p>📱 Plataforma: {platformInfo.platform}</p>
                    <p>🌐 Navegador: {platformInfo.browser}</p>
                    <p>🔧 Standalone: {platformInfo.isStandalone ? 'Sí' : 'No'}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continuar Usando la App
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <Chrome className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Instrucciones de Instalación
                  </h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {currentInstructions.map((instruction, index) => (
                      <div 
                        key={index}
                        className={`flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                          index === currentStep 
                            ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                            : 'bg-muted/30'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                          index < currentStep 
                            ? 'bg-green-500 text-white' 
                            : index === currentStep 
                              ? 'bg-primary text-white animate-pulse' 
                              : 'bg-white/20 text-white'
                        }`}>
                          {index < currentStep ? '✓' : index + 1}
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          index === currentStep ? 'text-white font-medium' : 'text-white/80'
                        }`}>
                          {instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-amber-400 mt-0.5 text-sm sm:text-base">⚠️</div>
                    <div className="text-xs sm:text-sm text-amber-100">
                      <p className="font-medium mb-1 text-white">Importante:</p>
                      <p>Esta aplicación requiere Android 5.0 o superior. Asegúrate de habilitar la instalación desde fuentes desconocidas en la configuración de tu dispositivo.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Button 
                    onClick={() => {
                      try {
                        const link = document.createElement('a') as HTMLAnchorElement;
                        link.href = 'https://github.com/ComplicesConectaSw/ComplicesConecta/releases/download/v.3.3.0/app-release.apk';
                        link.download = 'app-release.apk';
                        document.body.appendChild(link as Node);
                        link.click();
                        if (document.body.contains(link as Node)) {
                          document.body.removeChild(link as Node);
                        }
                      } catch (error) {
                        logger.error('Error al descargar APK:', { error: error instanceof Error ? error.message : String(error) });
                        // Fallback: abrir en nueva ventana
                        window.open('https://github.com/ComplicesConectaSw/ComplicesConecta/releases/download/v.3.3.0/app-release.apk', '_blank');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Descargar APK Ahora
                  </Button>
                  
                  <div className="flex gap-2 sm:gap-3">
                    {currentStep > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        className="flex-1 text-xs sm:text-sm py-2"
                      >
                        Anterior
                      </Button>
                    )}
                    {currentStep < currentInstructions.length - 1 ? (
                      <Button 
                        onClick={() => setCurrentStep(Math.min(currentInstructions.length - 1, currentStep + 1))}
                        className="flex-1 text-xs sm:text-sm py-2"
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button 
                        onClick={onClose}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-xs sm:text-sm py-2"
                      >
                        Cerrar
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

