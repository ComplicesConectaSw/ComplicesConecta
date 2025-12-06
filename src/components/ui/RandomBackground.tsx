import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/hooks/useTheme';
import { useBgMode } from '@/hooks/useBgMode';
import { useAuth } from '@/features/auth/useAuth';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

interface RandomBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const MasterBackground = ({ children }: { children: React.ReactNode }) => {
  const { mode, reducedMotion } = useBgMode();
  const { profile } = useAuth();

  const init = useCallback(async (engine: unknown) => {
    await loadFull(engine as never);
  }, []);

  const finalMode = reducedMotion ? 'static' : mode;
  const isVideo = finalMode === 'video';
  const isParticles = finalMode === 'particles';
  const videoSrc = profile?.profile_type === 'couple'
    ? '/backgrounds/Animate-bg2.mp4'
    : '/backgrounds/animate-bg.mp4';

  return (
    <div className="relative min-h-screen overflow-hidden">
      {isVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover -z-50"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {isParticles && (
        <Particles
          id="global-particles"
          init={init}
          options={{
            fullScreen: { enable: true, zIndex: -1 },
            particles: {
              number: { value: profile?.is_premium ? 100 : 60 },
              color: { value: ['#00FFFF', '#FF00FF', '#AA00FF'] },
              links: { enable: true, distance: 150, color: '#00FFFF', opacity: 0.4 },
              move: { enable: true, speed: 1 },
              size: { value: { min: 1, max: 4 } },
            },
          }}
          className="fixed inset-0 pointer-events-none"
        />
      )}

      {profile?.is_premium && finalMode !== 'static' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <video autoPlay loop muted playsInline className="w-56 opacity-30">
            <source src="/backgrounds/logo-animated.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div className="relative z-20">{children}</div>
    </div>
  );
};

const fallbackBackground = '/backgrounds/bg1.jpg';
const backgrounds = [
  '/backgrounds/bg1.jpg',
  '/backgrounds/bg2.jpg',
  '/backgrounds/bg3.jpg',
  '/backgrounds/bg4.jpg',
  '/backgrounds/bg5.webp',
];

export const RandomBackground: React.FC<RandomBackgroundProps> = ({ children, className }) => {
  const { pathname } = useLocation();
  const { prefs } = useTheme();

  const resolvedBackground = useMemo(() => {
    if (prefs?.isCustom && prefs.background) {
      return prefs.background;
    }

    const index = Math.abs(Array.from(pathname).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % backgrounds.length;
    const randomBg = backgrounds[index];
    return randomBg || fallbackBackground;
  }, [prefs.background, prefs.isCustom, pathname]);

  // Si el usuario desactivó "Fondo Animado" o "Partículas" desde el engrane,
  // podemos mostrar un color sólido o el fondo estático sin efectos extra.
  // Aquí usamos las preferencias para decidir la opacidad o efectos.

  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden bg-black', className)}>
      {/* Capa de imagen de fondo */}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center bg-no-repeat'
        )}
        style={{ backgroundImage: `url(${resolvedBackground || fallbackBackground})` }}
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