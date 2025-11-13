import { useState, useEffect } from "react";
import { X, Rocket, Gift, Heart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/ui/Button";
import { DismissibleBanner } from "@/components/DismissibleBanner";
import { Card, CardContent } from "@/shared/ui/Card";
import { Link } from "react-router-dom";
import { logger } from '@/lib/logger';

export const BetaBanner = () => {
  const [isVisible, _setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detectar si es Android
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(userAgent.includes('android'));

    // Manejar scroll para ocultar banner
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <DismissibleBanner 
      storageKey="beta_banner" 
      className={`
        fixed top-0 left-0 right-0 z-40 
        transform transition-all duration-500 ease-in-out
        ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
      `}
    >
      <Card className="rounded-none border-0 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-bounce" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="flex items-center space-x-2 mb-1 sm:mb-0">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                      <Gift className="h-3 w-3 mr-1" />
                      BETA
                    </Badge>
                    <h3 className="text-white font-bold text-sm sm:text-base truncate">
                      ¡Acceso Exclusivo Beta!
                    </h3>
                  </div>
                  
                  <p className="text-white/90 text-xs sm:text-sm truncate">
                    Únete gratis y obtén beneficios premium de por vida 🎉
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              {isAndroid && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs px-2 py-1 h-auto hidden sm:inline-flex"
                  asChild
                >
                  <Link to="/premium">
                    <Heart className="h-3 w-3 mr-1" />
                    Premium
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </DismissibleBanner>
  );
};

export const BetaModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-glow">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 p-6 text-white text-center rounded-t-lg">
                <Rocket className="h-12 w-12 mx-auto mb-3 animate-bounce" />
                <h2 className="text-2xl font-bold mb-2">¡Bienvenido a la Beta!</h2>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  VERSIÓN BETA
                </Badge>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Ayúdanos a crear la mejor app de citas
                  </h3>
                  <p className="text-muted-foreground">
                    ComplicesConecta está en desarrollo. Tu feedback y apoyo son fundamentales para nosotros.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Gift className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Recompensas por Apoyo</h4>
                      <p className="text-sm text-muted-foreground">
                        Los usuarios que nos apoyen durante la Beta recibirán subscripciones gratuitas y beneficios exclusivos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Heart className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Comunidad Especial</h4>
                      <p className="text-sm text-muted-foreground">
                        Acceso prioritario a nuevas funciones y eventos exclusivos para beta testers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button 
                    variant="love" 
                    className="w-full"
                    onClick={() => {
                      // TODO: Handle donation/support action
                      logger.info("Support action");
                      setIsOpen(false);
                    }}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Apoyar el Proyecto
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    Explorar la App
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};