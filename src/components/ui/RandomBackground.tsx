import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/hooks/useTheme'; // Necesario para el engrane

// Tus imágenes renombradas a .jpg
const backgrounds = [
  '/backgrounds/bg1.jpg',
  '/backgrounds/bg2.jpg',
  '/backgrounds/bg3.jpg',
  '/backgrounds/bg4.jpg',
  '/backgrounds/bg5.webp',
];

interface RandomBackgroundProps {
  children?: React.ReactNode; // Hacemos children opcional
  className?: string;
}

export const RandomBackground: React.FC<RandomBackgroundProps> = ({ children, className }) => {
  const [bgUrl, setBgUrl] = useState(backgrounds[0]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { prefs } = useTheme(); // Escuchar configuración del engrane

  useEffect(() => {
    // Selección aleatoria al montar
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    
    // Precarga de imagen
    const img = new Image();
    img.src = randomBg;
    img.onload = () => {
      setBgUrl(randomBg);
      setIsLoaded(true);
    };
  }, []);

  // Si el usuario desactivó "Fondo Animado" o "Partículas" desde el engrane,
  // podemos mostrar un color sólido o el fondo estático sin efectos extra.
  // Aquí usamos las preferencias para decidir la opacidad o efectos.
  
  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden bg-black', className)}>
      {/* Capa de imagen de fondo */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      {/* Overlay Neón (Controlado por el engrane: glowLevel) */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-purple-900/30 to-pink-900/30",
          prefs.glowLevel === 'high' ? "animate-pulse" : "" 
        )} 
      />

      {/* Contenido (si lo hay) */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};