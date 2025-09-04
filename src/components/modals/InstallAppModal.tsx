import { useState } from "react";
import { X, Smartphone, Download, Chrome, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal = ({ isOpen, onClose }: InstallAppModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  if (!isOpen) return null;

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
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-auto shadow-glow animate-slide-down overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="bg-hero-gradient p-6 text-white text-center rounded-t-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Smartphone className="h-16 w-16 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Download className="h-6 w-6 text-green-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Instala ComplicesConecta!</h2>
            <p className="text-white/90 mb-4">
              Sigue estos pasos para instalar nuestra app en tu dispositivo Android
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Globe className="h-3 w-3 mr-1" />
                {browserNames[browser as keyof typeof browserNames]}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30">
                v1.3.3 (beta)
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Chrome className="h-5 w-5 text-primary" />
                Instrucciones de Instalación
              </h3>
              
              <div className="space-y-3">
                {currentInstructions.map((instruction, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                          ? 'bg-primary text-white animate-pulse' 
                          : 'bg-white/20 text-white'
                    }`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <p className={`text-sm ${
                      index === currentStep ? 'text-white font-medium' : 'text-white/80'
                    }`}>
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="text-amber-400 mt-0.5">⚠️</div>
                <div className="text-sm text-amber-100">
                  <p className="font-medium mb-1 text-white">Importante:</p>
                  <p>Esta aplicación requiere Android 5.0 o superior. Asegúrate de habilitar la instalación desde fuentes desconocidas en la configuración de tu dispositivo.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/app-release.apk';
                  link.download = 'app-release.apk';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar APK Ahora
              </Button>
              
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    className="flex-1"
                  >
                    Anterior
                  </Button>
                )}
                {currentStep < currentInstructions.length - 1 ? (
                  <Button 
                    onClick={() => setCurrentStep(Math.min(currentInstructions.length - 1, currentStep + 1))}
                    className="flex-1"
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button 
                    onClick={onClose}
                    className="flex-1 bg-gray-600 hover:bg-gray-700"
                  >
                    Cerrar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};
