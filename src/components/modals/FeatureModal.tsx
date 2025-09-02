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
      "🏖️ Resorts lifestyle y cruceros temáticos",
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
      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-sm border border-pink-300/30 text-white">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/20 p-4 rounded-full">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {data.title}
              </DialogTitle>
              <DialogDescription className="text-pink-200 text-lg">
                {data.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-black/30 rounded-lg p-6 border border-pink-300/20">
            <h3 className="text-xl font-semibold mb-4 text-pink-200">Características Principales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-6 border border-pink-300/20">
            <h3 className="text-xl font-semibold mb-3 text-pink-200">¿Por qué es importante?</h3>
            <p className="text-white/90 leading-relaxed">{data.benefits}</p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-pink-300/30 text-white hover:bg-pink-500/20"
            >
              Cerrar
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              onClick={onClose}
            >
              <Crown className="mr-2 h-4 w-4" />
              Explorar Ahora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
