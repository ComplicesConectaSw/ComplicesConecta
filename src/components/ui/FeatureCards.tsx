import React from 'react';
import { Heart, Shield, Users, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className
}) => {
  return (
    <div className={cn(
      "bg-gradient-to-br from-black/40 to-black/60 rounded-2xl p-8 shadow-soft hover:shadow-glow transition-all duration-300 transform hover:scale-105 border border-white/30 backdrop-blur-sm",
      className
    )}>
      {/* Icon */}
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-white/30 transition-colors shadow-lg border border-white/40">
        <div className="text-white drop-shadow-lg">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
          {title}
        </h3>
        <p className="text-white leading-relaxed drop-shadow-md">
          {description}
        </p>
      </div>
    </div>
  );
};

interface FeatureCardsProps {
  className?: string;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ className }) => {
  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Conexiones Auténticas",
      description: "Algoritmo inteligente que conecta personas con intereses reales en común"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verificación KYC Avanzada",
      description: "Perfiles verificados con tecnología blockchain y KYC para máxima seguridad y confianza"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Eventos Swinger Exclusivos",
      description: "Accede a fiestas privadas, encuentros y eventos exclusivos para la comunidad swinger"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Sistema de Tokens CMPX/GTK",
      description: "Gana tokens participando, accede a funciones premium y eventos VIP"
    }
  ];

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto",
      className
    )}>
      {features.map((feature, index) => (
        <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <FeatureCard
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        </div>
      ))}
    </div>
  );
};

