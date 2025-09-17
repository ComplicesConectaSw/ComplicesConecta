import React, { useState, useEffect } from 'react';
import UserGalleryPage from '@/components/gallery/UserGalleryPage';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Camera } from 'lucide-react';

const Gallery: React.FC = () => {
  const { user, isDemo } = useAuth();
  const [finalDemoMode, setFinalDemoMode] = useState(false);

  useEffect(() => {
    // Esta lógica se ejecuta solo en el cliente, después del montaje inicial.
    const checkDemoMode = () => {
      // Forzar la conversión a booleano estricto para evitar errores de tipo
      const isDemoFromAuth = !!(typeof isDemo === 'function' ? isDemo() : isDemo);
      const isDemoFromStorage = localStorage.getItem('demo_authenticated') === 'true';
      
      // Garantizar que el resultado final sea siempre un booleano estricto
      const finalResult = Boolean(isDemoFromAuth || isDemoFromStorage);
      setFinalDemoMode(finalResult);
    };

    checkDemoMode();
  }, [isDemo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Alert de modo demo con diseño responsivo y profesional */}
        {finalDemoMode && (
          <div 
            data-testid="demo-mode-alert"
            className="mb-6 sm:mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-purple-500/15 border border-purple-200/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
            
            <div className="relative p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-pulse" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h4 className="font-bold text-lg sm:text-xl text-purple-900 bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">
                    Modo Demo Activo
                  </h4>
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200/50 shadow-sm">
                    <span className="text-xs font-bold text-purple-700 tracking-wide">SIMULACIÓN</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-purple-700 leading-relaxed font-medium">
                  Esta galería muestra contenido simulado para demostración. Las imágenes subidas y cambios de privacidad no se guardarán permanentemente.
                </p>
              </div>
              
              <div className="hidden sm:flex w-16 h-16 rounded-full bg-gradient-to-r from-pink-400/20 to-purple-400/20 items-center justify-center backdrop-blur-sm border border-white/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-bounce shadow-lg"></div>
              </div>
            </div>
          </div>
        )}

        <UserGalleryPage 
          userId={user?.id} 
          isOwner={true}
          isDemo={finalDemoMode}
          viewerUserId={user?.id}
        />
      </div>
      <Navigation />
    </div>
  );
};

export default Gallery;
