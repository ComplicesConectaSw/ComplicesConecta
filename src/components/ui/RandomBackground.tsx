import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/hooks/useTheme';

// Tus imágenes renombradas a .jpg
const fallbackBackground = '/backgrounds/bg5.webp';
const backgrounds = [
  '/backgrounds/bg1.jpg',
  '/backgrounds/bg2.jpg',
  '/backgrounds/bg3.jpg',
  '/backgrounds/bg4.jpg',
  fallbackBackground,
];

interface RandomBackgroundProps {
  children?: React.ReactNode; // Hacemos children opcional
  className?: string;
}

export const RandomBackground: React.FC<RandomBackgroundProps> = ({ children, className }) => {
  const { pathname } = useLocation();
  const [bgUrl, setBgUrl] = useState(fallbackBackground);
  const [isLoaded, setIsLoaded] = useState(false);
  const { prefs } = useTheme();

  const resolvedBackground = useMemo(() => {
    if (prefs?.isCustom && prefs.background) {
      return prefs.background;
    }
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    return randomBg || fallbackBackground;
  }, [prefs.background, prefs.isCustom, pathname]);

  useEffect(() => {
    setIsLoaded(false);
    const img = new Image();
    img.src = resolvedBackground;
    img.onload = () => {
      setBgUrl(resolvedBackground);
      setIsLoaded(true);
    };
  }, [resolvedBackground]);

  // Si el usuario desactivó "Fondo Animado" o "Partículas" desde el engrane,
  // podemos mostrar un color sólido o el fondo estático sin efectos extra.
  // Aquí usamos las preferencias para decidir la opacidad o efectos.

  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden bg-black', className)}>
      {/* Capa de imagen de fondo */}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700',
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        )}
        style={{ backgroundImage: `url(${bgUrl || fallbackBackground})` }}
      />

      {/* Overlay Neón (Controlado por el engrane: glowLevel) */}
      <div 
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-purple-900/30 to-pink-900/30',
          prefs.glowLevel === 'high' ? 'animate-pulse' : '' 
        )} 
      />

      {/* Contenido (si lo hay) */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};