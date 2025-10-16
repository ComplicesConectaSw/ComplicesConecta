import { useState, useEffect } from "react";
import { X, Heart, Sparkles, Users, Gift, Star, Zap, HelpCircle, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const welcomeSteps = [
    {
      icon: Heart,
      title: "¡Bienvenido a ComplicesConecta!",
      subtitle: "Tu nueva aventura comienza aquí",
      description: "Descubre conexiones auténticas y experiencias únicas con personas que comparten tus intereses en la comunidad lifestyle más grande de México.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Gift,
      title: "🪙 Sistema de Tokens CMPX",
      subtitle: "Gana recompensas por invitar amigos",
      description: "Obtén 50 CMPX por cada amigo que invites + 50 CMPX de bienvenida para ellos. Usa tus tokens para desbloquear funciones premium durante la fase beta.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Sparkles,
      title: "Versión Beta Exclusiva",
      subtitle: "Sé parte de algo especial",
      description: "Estás entre los primeros en probar nuestra plataforma. Acceso gratuito a funciones premium con tokens. Si encuentras problemas, repórtalos en FAQ.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Zap,
      title: "Funciones Premium Gratis",
      subtitle: "Todo desbloqueado en la beta",
      description: "Chat ilimitado, galería privada, eventos exclusivos y más. Todo disponible usando tus tokens CMPX sin costo adicional.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Globe,
      title: "🌍 Próximamente: World ID",
      subtitle: "Verificación de identidad con Worldcoin",
      description: "Pronto podrás verificar tu identidad humana con World ID y ganar 100 CMPX adicionales. Integración con Worldchain para máxima seguridad y privacidad.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Users,
      title: "🎭 Perfiles Demo Disponibles",
      subtitle: "Prueba la plataforma con cuentas de demostración",
      description: "Accede con credenciales demo para explorar todas las funciones. Single: single@outlook.es (contraseña: 123456) | Pareja: pareja@outlook.es (contraseña: 123456). Explora chats, perfiles y funciones premium sin compromiso.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Shield,
      title: "🛡️ Sistema de Moderación",
      subtitle: "Comunidad segura y protegida",
      description: "Contamos con un equipo de moderadores dedicados que mantienen la comunidad segura. ¿Interesado en ayudar? Puedes aplicar para ser moderador y contribuir a crear un ambiente positivo para todos.",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      icon: Zap,
      title: "🎯 ¡Todo es Interactivo!",
      subtitle: "Cada elemento tiene vida propia",
      description: "Todos los botones, enlaces y elementos de la página son dinámicos y animados. ¡Haz clic en todo! Cada interacción te llevará a nuevas experiencias. Los iconos brillan, los botones se animan y cada sección tiene sorpresas esperándote.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setCurrentStep(0);
    }, 300);
  };

  const currentStepData = welcomeSteps[currentStep];
  const IconComponent = currentStepData.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className={`transition-all duration-500 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <Card className="w-full max-w-lg shadow-glow border-0 overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles className="w-6 h-6 text-accent animate-float" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-15">
            <Star className="w-5 h-5 text-primary animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute top-1/2 right-6 opacity-10">
            <Zap className="w-4 h-4 text-secondary animate-float" style={{ animationDelay: '1s' }} />
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-20 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 p-2 rounded-full bg-black/20 backdrop-blur-sm"
            onClick={handleClose}
          >
            <X className="h-5 w-5 text-white hover:text-red-400" />
          </Button>

          <CardContent className="p-8 text-center relative z-10">
            {/* Icon with Animation */}
            <div className={`${currentStepData.bgColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow`}>
              <IconComponent className={`w-10 h-10 ${currentStepData.color}`} />
            </div>

            {/* Special Badges */}
            {currentStep === 1 && (
              <div className="mb-4">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 animate-bounce">
                  🪙 TOKENS CMPX
                </Badge>
              </div>
            )}
            {currentStep === 2 && (
              <div className="mb-4">
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 animate-bounce">
                  BETA EXCLUSIVA
                </Badge>
              </div>
            )}
            {currentStep === 3 && (
              <div className="mb-4">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-500 border-purple-500/30 animate-bounce">
                  ⚡ PREMIUM GRATIS
                </Badge>
              </div>
            )}
            {currentStep === 4 && (
              <div className="mb-4">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-blue-500/30 animate-bounce">
                  🌍 WORLD ID PRÓXIMAMENTE
                </Badge>
              </div>
            )}
            {currentStep === 6 && (
              <div className="mb-4">
                <Badge variant="secondary" className="bg-blue-400/20 text-blue-400 border-blue-400/30 animate-bounce">
                  🛡️ MODERACIÓN SEGURA
                </Badge>
              </div>
            )}
            {currentStep === 7 && (
              <div className="mb-4">
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 animate-bounce">
                  🎯 EXPLORA TODO
                </Badge>
              </div>
            )}

            {/* Content */}
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-2xl font-bold text-white">
                {currentStepData.title}
              </h2>
              <h3 className="text-lg text-white font-medium">
                {currentStepData.subtitle}
              </h3>
              <p className="text-white/90 leading-relaxed">
                {currentStepData.description}
                {currentStep === 1 && (
                  <span className="inline-flex items-center gap-1 ml-1 text-primary font-medium">
                    <HelpCircle className="w-4 h-4" />
                    FAQ
                  </span>
                )}
              </p>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center space-x-2 mt-8 mb-6">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-primary scale-125' 
                      : index < currentStep 
                        ? 'bg-primary/60' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center space-x-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1"
              >
                Anterior
              </Button>
              
              <Button
                variant={currentStep === welcomeSteps.length - 1 ? "love" : "default"}
                onClick={handleNext}
                className="flex-1 relative overflow-hidden group"
              >
                {currentStep === welcomeSteps.length - 1 ? (
                  <>
                    <Heart className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="currentColor" />
                    ¡Comenzar!
                  </>
                ) : (
                  'Siguiente'
                )}
              </Button>
            </div>

            {/* Skip Option */}
            <button
              onClick={handleClose}
              className="text-sm text-white/70 hover:text-white transition-colors mt-4 underline"
            >
              Saltar introducción
            </button>
          </CardContent>

          {/* Animated Border Effect */}
          <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-lg animate-pulse opacity-50"></div>
        </Card>
      </div>
    </div>
  );
};
