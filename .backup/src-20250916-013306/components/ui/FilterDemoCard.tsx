import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Settings
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 group overflow-hidden h-full">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-white/20">
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                  Filtro Demo
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/80 text-sm mb-4 leading-relaxed">
            {card.description}
          </p>

          {/* Demo Value */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Valor de ejemplo:</span>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                {card.demoValue}
              </Badge>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-white/70 text-xs mb-4 italic">
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
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-white/70 text-xs">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onCtaClick(card.ctaAction)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 group-hover:shadow-lg transition-all duration-300"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>{card.ctaText}</span>
              <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
            </span>
          </Button>

          {/* Interactive Demo Indicator */}
          <div className="mt-3 text-center">
            <span className="text-xs text-white/50">
              💡 Regístrate para usar filtros reales
            </span>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
