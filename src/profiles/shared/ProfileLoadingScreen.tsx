import { useState, useEffect } from "react";
import { Heart, Sparkles, Users, Camera, Star, Shield } from "lucide-react";

export interface ProfileLoadingScreenProps {
  onComplete: () => void;
  profileName: string;
  profileType: 'single' | 'couple';
}

export const ProfileLoadingScreen = ({ onComplete, profileName, profileType }: ProfileLoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    `Cargando perfil de ${profileName}...`,
    "Verificando fotos y contenido...",
    "Sincronizando preferencias lifestyle...",
    `¡Perfil de ${profileName} listo!`
  ];

  const icons = [Users, Camera, Shield, Star];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 3;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 1000);

    return () => clearInterval(textInterval);
  }, [loadingTexts.length]);

  const CurrentIcon = icons[currentText] || Users;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hero-gradient">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-red-900/30">
        <div className="absolute top-32 left-32 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 right-32 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="relative z-10 text-center space-y-6 sm:space-y-8 px-4 sm:px-6 max-w-xs sm:max-w-md mx-auto">
        {/* Profile Avatar Placeholder */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse opacity-30"></div>
            <div className="absolute inset-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center backdrop-blur-sm">
              <CurrentIcon className="w-12 h-12 text-white animate-bounce" />
            </div>
            {/* Floating sparkles around avatar */}
            <div className="absolute -top-2 -right-2 animate-ping">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-pulse">
              <Heart className="w-5 h-5 text-pink-300" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold animate-fade-in bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent stable-element">
            {profileName}
          </h2>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <span className="text-sm text-white/80">
              {profileType === 'couple' ? '👫 Pareja' : '👤 Individual'}
            </span>
          </div>
          <p className="text-base sm:text-lg text-white/90 animate-slide-up max-w-xs sm:max-w-md mx-auto px-2">
            {loadingTexts[currentText]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto space-y-3">
          <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm border border-white/10">
            <div 
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 h-4 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Cargando perfil...</span>
            <span className="text-white font-medium">{progress}%</span>
          </div>
        </div>

        {/* Lifestyle Badge */}
        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full backdrop-blur-sm border border-white/20">
          <Shield className="w-4 h-4 text-green-300" />
          <span className="text-white/90 text-sm font-medium">Perfil Verificado Lifestyle</span>
        </div>

        {/* Floating Elements - Hidden on mobile */}
        <div className="absolute top-16 left-16 animate-float hidden sm:block">
          <Sparkles className="w-5 h-5 text-pink-300/70" />
        </div>
        <div className="absolute bottom-16 right-16 animate-float hidden sm:block" style={{ animationDelay: '1.5s' }}>
          <Heart className="w-6 h-6 text-red-300/70" />
        </div>
        <div className="absolute top-1/4 right-24 animate-float hidden sm:block" style={{ animationDelay: '3s' }}>
          <Star className="w-4 h-4 text-yellow-300/70" />
        </div>
        <div className="absolute bottom-1/4 left-24 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
          <Users className="w-5 h-5 text-purple-300/70" />
        </div>
      </div>
    </div>
  );
};

export default ProfileLoadingScreen;
