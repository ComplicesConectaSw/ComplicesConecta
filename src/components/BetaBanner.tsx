import { useState } from "react";
import { X, Rocket, Gift, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const BetaBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-hero-gradient border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Rocket className="h-5 w-5 text-white animate-pulse" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                BETA
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">
                🚀 ¡Estamos en fase Beta! Prueba la app y ayúdanos a mejorarla
              </p>
              <p className="text-white/80 text-sm">
                Tus donaciones nos ayudan y recibirás recompensas especiales al final de la Beta
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="hero" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                asChild
              >
                <Link to="/support">
                  <Gift className="h-4 w-4 mr-1" />
                  Apoyar
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
              
              <div className="bg-hero-gradient p-6 text-white text-center rounded-t-lg">
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
                      console.log("Support action");
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