import { useState, useEffect } from "react";
import { Heart, Sparkles, Users, Zap } from "lucide-react";

export interface LoadingScreenProps {
  onComplete: () => void
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    "Conectando corazones...",
    "Preparando experiencias únicas...",
    "Creando conexiones auténticas...",
    "¡Casi listo para encontrar tu cómplice!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Call onComplete when loading reaches 100%
          setTimeout(() => onComplete(), 100);
          return 100;
        }
        return prev + 4;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [loadingTexts.length, onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 1500);

    return () => clearInterval(textInterval);
  }, [loadingTexts.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-accent to-secondary overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white/20 rounded-full animate-pulse blur-lg"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-white/5 rounded-full animate-float blur-2xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/15 rounded-full animate-pulse blur-xl" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Floating Hearts - Hidden on mobile */}
        <Heart className="absolute top-32 left-1/4 w-6 h-6 sm:w-8 sm:h-8 text-white/30 animate-float hidden sm:block" fill="currentColor" style={{ animationDelay: '0.2s' }} />
        <Heart className="absolute bottom-40 right-1/3 w-4 h-4 sm:w-6 sm:h-6 text-white/40 animate-float hidden sm:block" fill="currentColor" style={{ animationDelay: '1.5s' }} />
        <Sparkles className="absolute top-1/3 right-1/4 w-5 h-5 sm:w-7 sm:h-7 text-white/35 animate-float hidden sm:block" style={{ animationDelay: '0.8s' }} />
        <Users className="absolute bottom-1/3 left-1/3 w-7 h-7 sm:w-9 sm:h-9 text-white/25 animate-float hidden sm:block" style={{ animationDelay: '1.2s' }} />
        <Zap className="absolute top-1/2 left-1/5 w-4 h-4 sm:w-5 sm:h-5 text-white/45 animate-float hidden sm:block" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-xs sm:max-w-md mx-auto">
        {/* Logo Animation */}
        <div className="mb-8 relative">
          <div className="relative inline-block">
            <Heart 
              className="w-16 h-16 sm:w-20 sm:h-20 text-white animate-pulse-glow mx-auto" 
              fill="currentColor"
            />
            <div className="absolute inset-0 animate-ping">
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-white/50 mx-auto" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4 animate-slide-up">
            ComplicesConecta
          </h1>
        </div>

        {/* Loading Text */}
        <div className="mb-6 sm:mb-8 h-6 sm:h-8">
          <p className="text-lg sm:text-xl text-white/90 animate-fade-in-out px-2">
            {loadingTexts[currentText]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Progress Percentage */}
        <p className="text-white/80 text-sm font-medium">
          {progress}%
        </p>

        {/* Loading Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Animated Border */}
      <div className="absolute inset-0 border-4 border-white/20 animate-pulse"></div>
      
    </div>
  );
};
