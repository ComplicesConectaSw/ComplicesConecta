import React, { useState } from 'react';
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  MapPin, 
  Heart, 
  Shield, 
  Crown, 
  Wifi,
  Settings,
  Info
} from 'lucide-react';
import type { FilterDemoCard as FilterDemoCardType } from '@/lib/infoCards';

interface FilterDemoCardProps {
  card: FilterDemoCardType;
  index: number;
  onCtaClick: (action: 'register' | 'login') => void;
}

const getFilterIcon = (filterType: string) => {
  switch (filterType) {
    case 'age': return Users;
    case 'distance': return MapPin;
    case 'interests': return Heart;
    case 'verified': return Shield;
    case 'premium': return Crown;
    case 'online': return Wifi;
    default: return Settings;
  }
};

const getFilterColor = (filterType: string) => {
  switch (filterType) {
    case 'age': return 'text-blue-400';
    case 'distance': return 'text-green-400';
    case 'interests': return 'text-pink-400';
    case 'verified': return 'text-yellow-400';
    case 'premium': return 'text-purple-400';
    case 'online': return 'text-emerald-400';
    default: return 'text-gray-400';
  }
};

export const FilterDemoCard: React.FC<FilterDemoCardProps> = ({ card, index, onCtaClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = getFilterIcon(card.filterType);
  const iconColor = getFilterColor(card.filterType);

  const getHoverInfo = (filterType: string) => {
    switch (filterType) {
      case 'age': return 'Filtra perfiles por rango de edad para encontrar conexiones más compatibles';
      case 'distance': return 'Encuentra personas cerca de ti o amplía tu búsqueda según prefieras';
      case 'interests': return 'Conecta con personas que comparten tus gustos y estilo de vida';
      case 'verified': return 'Solo perfiles verificados para mayor seguridad y confianza';
      case 'premium': return 'Accede a usuarios premium con características exclusivas';
      case 'online': return 'Ve quién está conectado ahora para conversaciones inmediatas';
      default: return 'Filtro personalizado para mejorar tu experiencia';
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className={`relative bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 group overflow-hidden h-full ${isHovered ? 'bg-blue-500/20 shadow-lg shadow-blue-500/20' : ''}`}>
              <CardContent className="p-6 h-full flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 ${isHovered ? 'scale-110 bg-blue-500/30' : ''}`}>
                      <Icon className={`h-6 w-6 ${iconColor} transition-all duration-300 ${isHovered ? 'text-blue-300' : ''}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold text-white transition-all duration-300 ${isHovered ? 'text-blue-200' : ''}`}>{card.title}</h3>
                      <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                        Filtro Demo
                      </Badge>
                    </div>
                  </div>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-blue-300"
                    >
                      <Info className="h-5 w-5" />
                    </motion.div>
                  )}
                </div>

                {/* Description */}
                <p className={`text-white/80 text-sm mb-4 leading-relaxed transition-all duration-300 ${isHovered ? 'text-blue-100' : ''}`}>
                  {card.description}
                </p>

                {/* Demo Value */}
                <div className={`mb-4 p-3 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 ${isHovered ? 'bg-blue-500/10 border-blue-400/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-white/60 text-xs transition-all duration-300 ${isHovered ? 'text-blue-200' : ''}`}>Valor de ejemplo:</span>
                    <Badge className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 transition-all duration-300 ${isHovered ? 'from-blue-500 to-blue-600' : ''}`}>
                      {card.demoValue}
                    </Badge>
                  </div>
                </div>

                {/* Explanation */}
                <p className={`text-white/70 text-xs mb-4 italic transition-all duration-300 ${isHovered ? 'text-blue-200' : ''}`}>
                  {card.explanation}
                </p>

                {/* Benefits */}
                <div className="space-y-2 mb-6 flex-grow">
                  {card.benefits.map((benefit, idx) => (
                    <motion.div 
                      key={idx} 
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (idx * 0.1) }}
                    >
                      <CheckCircle className={`h-4 w-4 text-green-400 flex-shrink-0 transition-all duration-300 ${isHovered ? 'text-blue-300' : ''}`} />
                      <span className={`text-white/70 text-xs transition-all duration-300 ${isHovered ? 'text-blue-200' : ''}`}>{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => onCtaClick(card.ctaAction)}
                  className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 group-hover:shadow-lg transition-all duration-300 ${isHovered ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : ''}`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>{card.ctaText}</span>
                    <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                  </span>
                </Button>

                {/* Interactive Demo Indicator */}
                <div className="mt-3 text-center">
                  <span className={`text-xs text-white/50 transition-all duration-300 ${isHovered ? 'text-blue-300' : ''}`}>
                    💡 Regístrate para usar filtros reales
                  </span>
                </div>
              </CardContent>
              
              {/* Decorative gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${isHovered ? 'from-blue-500/10 to-blue-600/10' : ''}`} />
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-blue-900/90 border-blue-500/50 text-white max-w-xs">
            <p className="text-sm">{getHoverInfo(card.filterType)}</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
};