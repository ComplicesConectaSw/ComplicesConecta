import React from 'react';
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { InfoCard as InfoCardType } from '@/lib/infoCards';

interface InfoCardProps {
  card: InfoCardType;
  index: number;
  onCtaClick: (action: 'register' | 'login' | 'premium') => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ card, index, onCtaClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 group overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{index + 1}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  Información
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/80 text-sm mb-4 leading-relaxed">
            {card.description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {card.features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-white/70 text-xs">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onCtaClick(card.ctaAction)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 group-hover:shadow-lg transition-all duration-300"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>{card.ctaText}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </Button>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
