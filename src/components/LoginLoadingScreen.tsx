import { useState, useEffect } from "react";
import { Heart, Sparkles, Users, UserCheck, Shield } from "lucide-react";

export interface LoginLoadingScreenProps {
  onComplete: () => void;
  userType: 'single' | 'couple';
  userName?: string;
  userProfile?: {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    coupleName?: string;
    partner1?: { name?: string; nickname?: string };
    partner2?: { name?: string; nickname?: string };
  };
}

export const LoginLoadingScreen = ({ onComplete, userType, userName, userProfile }: LoginLoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  // Función para obtener el nombre personalizado
  const getPersonalizedName = () => {
    if (userType === 'single') {
      if (userProfile?.nickname) {
        return userProfile.nickname;
      } else if (userProfile?.firstName) {
        return userProfile.firstName;
      } else {
        return userName || 'Usuario';
      }
    } else if (userType === 'couple') {
      if (userProfile?.coupleName) {
        return userProfile.coupleName;
      } else if (userProfile?.partner1?.nickname && userProfile?.partner2?.nickname) {
        return `${userProfile.partner1.nickname} & ${userProfile.partner2.nickname}`;
      } else if (userProfile?.partner1?.name && userProfile?.partner2?.name) {
        return `${userProfile.partner1.name} & ${userProfile.partner2.name}`;
      } else {
        return userName || 'Pareja';
      }
    }
    return userName || 'Usuario';
  };

  const personalizedName = getPersonalizedName();

  const singleTexts = [
    "Verificando tu identidad...",
    "Preparando tu perfil swinger...",
    "Conectando con la comunidad lifestyle...",
    `¡Bienvenido/a ${personalizedName}!`
  ];

  const coupleTexts = [
    "Verificando perfiles de pareja...",
    "Sincronizando preferencias lifestyle...",
    "Activando modo pareja swinger...",
    `¡Bienvenidos ${personalizedName}!`
  ];

  const loadingTexts = userType === 'couple' ? coupleTexts : singleTexts;

  const icons = [Shield, UserCheck, Users, Heart];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 1200);

    return () => clearInterval(textInterval);
  }, [loadingTexts.length]);

  const CurrentIcon = icons[currentText] || Heart;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hero-gradient">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 text-center space-y-6 sm:space-y-8 px-4 sm:px-6 max-w-xs sm:max-w-md mx-auto">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse opacity-20"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <CurrentIcon className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white animate-fade-in">
            {userType === 'couple' ? 'Acceso Pareja' : 'Acceso Individual'}
          </h2>
          <p className="text-lg sm:text-xl text-white/90 animate-slide-up px-2">
            {loadingTexts[currentText]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto space-y-3">
          <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-pink-500 to-red-500 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-white/70 text-sm font-medium">{progress}%</p>
        </div>

        {/* Floating Elements - Hidden on mobile */}
        <div className="absolute top-10 left-10 animate-float hidden sm:block">
          <Sparkles className="w-6 h-6 text-pink-300/60" />
        </div>
        <div className="absolute bottom-10 right-10 animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
          <Heart className="w-8 h-8 text-red-300/60" />
        </div>
        <div className="absolute top-1/3 right-20 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
          <Users className="w-5 h-5 text-purple-300/60" />
        </div>
      </div>
    </div>
  );
};

export default LoginLoadingScreen;
