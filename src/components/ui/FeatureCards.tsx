import React from 'react';
import { Heart, Shield, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      "bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100",
      className
    )}>
      {/* Icon */}
      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 mx-auto">
        <div className="text-pink-600">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
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
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
      className
    )}>
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  );
};

