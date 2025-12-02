import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';   // ← CORRECTO (así lo tienes tú en todos lados)

const backgrounds = [
  '/backgrounds/Background(1).webp',
  '/backgrounds/Background(2).webp',
  '/backgrounds/Background(3).webp',
  '/backgrounds/Background(4).webp',
  '/backgrounds/default-neon.jpg,.webp',
];

interface RandomBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const RandomBackground: React.FC<RandomBackgroundProps> = ({ children, className }) => {
  const [bgUrl, setBgUrl] = useState('/backgrounds/cargando.webp');

  useEffect(() => {
    // Selecciona uno aleatorio cada vez que se monta el componente
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setBgUrl(randomBg);

    // Precarga la imagen para que no parpadee
    const img = new Image();
    img.src = randomBg;
  }, []);

  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden', className)}>
      {/* Fondo aleatorio */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed transition-opacity duration-1000 opacity-100"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      {/* Overlay neón suave que respira (brutal efecto) */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-pink-600/30 animate-pulse" />

      {/* Loader elegante mientras carga el fondo (usa tu cargando.webp) */}
      {bgUrl.includes('cargando') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <img src="/backgrounds/cargando.webp" alt="Cargando..." className="w-32 h-32" />
        </div>
      )}

      {/* Contenido de la app */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};