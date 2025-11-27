import React from 'react';
import { Heart } from 'lucide-react';
import { FeatureCards } from './FeatureCards';
import { cn } from '@/shared/lib/cn';

interface WhyChooseSectionProps {
  className?: string;
}

export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({ className }) => {
  return (
    <section className={cn(
      "py-16 px-4",
      className
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Background */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-violet-800 rounded-3xl"></div>
          
          {/* Pink Speckles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="absolute top-20 right-20 w-1 h-1 bg-pink-300 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-pink-300 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-pink-300 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-12">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                ¿Por qué elegir ComplicesConecta?
              </h2>
              
              {/* Description */}
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-white/90 leading-relaxed">
                  La plataforma más segura y discreta para la comunidad swinger. 
                  <span className="inline-flex items-center mx-1">
                    <Heart className="w-4 h-4 text-pink-300 mx-1" fill="currentColor" />
                  </span>
                  Conectamos parejas y solteros con verificación avanzada, tecnología blockchain y total privacidad.
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <FeatureCards />
          </div>
        </div>
      </div>
    </section>
  );
};

