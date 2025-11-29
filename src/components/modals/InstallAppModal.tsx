import { useState } from "react";
import { X, Smartphone, Download, Globe, CheckCircle } from "lucide-react";
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
    if (typeof navigator === 'undefined') return 'chrome';
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

  const handleDownload = () => {
    try {
      // FIX: Casting explícito 'as any' para evitar conflictos de tipos
      const link = document.createElement('a') as HTMLAnchorElement;
      link.href = 'https://github.com/ComplicesConectaSw/ComplicesConecta/releases/download/v.3.3.0/app-release.apk';
      link.setAttribute('download', 'app-release.apk');
      
      document.body.appendChild(link as any);
      
      link.click();
      
      // Limpieza del DOM
      if (document.body.contains(link as any)) {
        document.body.removeChild(link as any);
      }
      
      // Avanzar paso automáticamente
      if (currentStep === 0) setCurrentStep(1);
    } catch (error) {
      logger.error('Error descarga APK', { error });
      window.open('https://github.com/ComplicesConectaSw/ComplicesConecta/releases/download/v.3.3.0/app-release.apk', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Tarjeta Principal con Estilo Dark Glass (Fondo oscuro forzado) */}
      <Card className="w-full max-w-lg mx-auto bg-neutral-900 border-white/10 shadow-2xl overflow-hidden rounded-2xl text-white">
        <div className="relative">
          {/* Botón Cerrar */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-white/50 hover:text-white hover:bg-white/10 rounded-full p-2"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          {/* Header Gradiente */}
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                {isAPK ? (
                  <CheckCircle className="h-16 w-16 text-green-400 animate-pulse filter drop-shadow-lg" />
                ) : (
                  <>
                    <Smartphone className="h-16 w-16 text-white drop-shadow-lg" />
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                      <Download className="h-4 w-4 text-purple-600" />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              {isAPK ? "¡Instalada Correctamente!" : "Instala la App Android"}
            </h2>
            
            {!isAPK && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                  <Globe className="h-3 w-3 mr-1" />
                  {browserNames[browser as keyof typeof browserNames]}
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  v2.1.2 (stable)
                </Badge>
              </div>
            )}
          </div>
          
          {/* AQUÍ ESTABA EL PROBLEMA: Cambiado a bg-neutral-900/95 para legibilidad */}
          <CardContent className="p-6 space-y-6 bg-neutral-900/95">
            {isAPK ? (
              // CONTENIDO: YA INSTALADO
              <div className="space-y-6 text-center">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-200 text-sm">
                    La aplicación está funcionando correctamente. No necesitas hacer nada más.
                  </p>
                </div>
                
                {/* Info extra opcional */}
                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 text-xs text-blue-200 text-left space-y-1">
                    <p>📱 Plataforma: {platformInfo.platform}</p>
                    <p>🌐 Navegador: {platformInfo.browser}</p>
                </div>

                <Button 
                  onClick={onClose}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20"
                >
                  Continuar
                </Button>
              </div>
            ) : (
              // CONTENIDO: INSTRUCCIONES DE INSTALACIÓN
              <>
                <div className="space-y-4">
                  {currentInstructions.map((instruction, index) => (
                    <div 
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 border ${
                        index === currentStep 
                          ? 'bg-purple-900/30 border-purple-500/40 shadow-lg shadow-purple-900/30' 
                          : 'bg-neutral-900/70 border-white/10'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        index < currentStep 
                          ? 'bg-green-500 text-white' 
                          : index === currentStep 
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' 
                            : 'bg-neutral-700/80 text-white/60'
                      }`}>
                        {index < currentStep ? '✓' : index + 1}
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        index === currentStep ? 'text-white font-medium' : 'text-zinc-400'
                      }`}>
                        {instruction}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Botón Descarga */}
                <Button 
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Download className="w-5 h-5" />
                  Descargar APK Ahora
                </Button>

                {/* Navegación de Pasos Manual */}
                <div className="flex gap-3 mt-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="flex-1 border-white/20 text-white bg-neutral-900/60 hover:bg-neutral-800/70 disabled:opacity-30"
                    >
                        Anterior
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(Math.min(currentInstructions.length - 1, currentStep + 1))}
                        disabled={currentStep === currentInstructions.length - 1}
                        className="flex-1 border-white/20 text-white bg-neutral-900/60 hover:bg-neutral-800/70 disabled:opacity-30"
                    >
                        Siguiente
                    </Button>
                </div>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};