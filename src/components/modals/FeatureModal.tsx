import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, Zap, Crown, Lock, MapPin, Calendar } from "lucide-react";

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'connections' | 'verification' | 'events' | 'tokens';
}

const featureData = {
  connections: {
    icon: Heart,
    title: "Conexiones Auténticas Swinger",
    description: "Algoritmo inteligente diseñado específicamente para la comunidad lifestyle",
    features: [
      "🔥 Matching basado en fetiches y preferencias íntimas",
      "💕 Compatibilidad swinger avanzada con IA",
      "🎭 Perfiles verificados de parejas y solteros lifestyle",
      "🌟 Sistema de reputación comunitario",
      "💬 Chat encriptado para conversaciones discretas",
      "📍 Geolocalización para encuentros locales"
    ],
    benefits: "Encuentra parejas y solteros que compartan tus mismos intereses en el intercambio, soft swap, full swap y experiencias grupales."
  },
  verification: {
    icon: Shield,
    title: "Verificación KYC Lifestyle Avanzada",
    description: "Máxima seguridad y confianza para la comunidad swinger",
    features: [
      "🆔 Verificación de identidad con documentos oficiales",
      "📸 Validación facial en tiempo real",
      "🔐 Tecnología blockchain para datos seguros",
      "✅ Verificación de experiencia swinger",
      "🏆 Badges de confianza comunitaria",
      "🛡️ Protección contra perfiles falsos"
    ],
    benefits: "Garantizamos que todos los miembros sean personas reales con experiencia verificada en el lifestyle swinger."
  },
  events: {
    icon: Users,
    title: "Eventos Swinger Exclusivos",
    description: "Acceso VIP a la mejor vida nocturna lifestyle",
    features: [
      "🎉 Fiestas privadas en clubs exclusivos",
      "🏖️ Descuentos exclusivos en clubs lifestyle",
      "🍾 Eventos VIP solo para miembros verificados",
      "🎭 Fiestas temáticas y de disfraces",
      "💑 Encuentros para parejas principiantes",
      "🌍 Eventos internacionales lifestyle"
    ],
    benefits: "Conecta con la comunidad swinger en eventos seguros, discretos y llenos de diversión para adultos."
  },
  tokens: {
    icon: Zap,
    title: "Sistema de Tokens CMPX/GTK",
    description: "Economía digital para experiencias premium",
    features: [
      "💎 Gana tokens participando en la comunidad",
      "🎁 Regalos virtuales y propinas discretas",
      "👑 Acceso a funciones premium exclusivas",
      "🎫 Descuentos en eventos y experiencias VIP",
      "💰 Monetiza tu contenido lifestyle",
      "🏪 Marketplace de productos para adultos"
    ],
    benefits: "Un ecosistema económico que recompensa la participación activa y el contenido de calidad en la comunidad."
  }
};

export const FeatureModal: React.FC<FeatureModalProps> = ({ isOpen, onClose, feature }) => {
  const data = featureData[feature];
  const IconComponent = data.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-sm border border-pink-300/30 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
            <div className="bg-primary/20 p-3 sm:p-4 rounded-full">
              <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <DialogTitle className="text-lg sm:text-2xl font-bold text-white">
                {data.title}
              </DialogTitle>
              <DialogDescription className="text-pink-200 text-sm sm:text-lg">
                {data.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-black/30 rounded-lg p-4 sm:p-6 border border-pink-300/20">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-pink-200">Características Principales</h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {data.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-xs sm:text-sm text-white/90 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-4 sm:p-6 border border-pink-300/20">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-pink-200">¿Por qué es importante?</h3>
            <p className="text-white/90 leading-relaxed text-xs sm:text-sm">{data.benefits}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-pink-300/30 text-white hover:bg-pink-500/20"
            >
              Cerrar
            </Button>
            {feature === 'tokens' ? (
              <Button
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                onClick={() => {
                  onClose();
                  window.location.href = '/tokens-info';
                }}
              >
                <Zap className="mr-2 h-4 w-4" />
                Más Información
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                onClick={onClose}
              >
                <Crown className="mr-2 h-4 w-4" />
                Explorar Ahora
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
