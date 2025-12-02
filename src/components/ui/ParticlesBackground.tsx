// src/components/ui/ParticlesBackground.tsx
import React, { useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

import { useTheme } from '../../hooks/useTheme';
import { cn } from '@/shared/lib/cn';

interface ParticlesBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ children, className }) => {
  const { prefs, loading } = useTheme();

  // Para asegurar visibilidad mientras afinamos la UI, mantenemos partículas activas
  const showParticles = (prefs.enableParticles ?? true) && (prefs.particlesIntensity ?? 40) > 0;

  const speedValue =
    prefs.animationSpeed === 'slow' ? 0.2 :
    prefs.animationSpeed === 'fast' ? 2 :
    0.9;

  const particlesInit = async (engine: unknown) => {
    await loadFull(engine as never);
  };

  const particlesOptions = useMemo(
    () => ({
      particles: {
        number: { value: showParticles ? (prefs.particlesIntensity || 40) : 0 },
        color: { value: ['#00FFFF', '#FF00FF'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } },
        move: { enable: showParticles, speed: speedValue, random: true },
      },
      interactivity: { events: { onHover: { enable: true, mode: 'repulse' } } },
      retina_detect: true,
    }),
    [prefs.particlesIntensity, prefs.enableParticles, speedValue, showParticles]
  );

  if (loading) return <div>Cargando tema...</div>;

  const glowClass =
    prefs.enableBackgroundAnimations
      ? prefs.glowLevel === 'high'
        ? 'animate-glow-high'
        : prefs.glowLevel === 'low'
        ? 'animate-glow-low'
        : 'animate-glow-medium'
      : '';

  return (
    <div className={cn('relative min-h-screen', className)}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Fondo base: estático o animado según preferencias */}
        {prefs.enableBackgroundAnimations ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/backgrounds/batch_process.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${prefs.background})` }}
          />
        )}

        {/* Glow overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20',
            glowClass
          )}
        />
        
        {/* CONDICIONAL AGREGADO: Solo renderiza si el usuario quiere partículas */}
        {showParticles && (
          <Particles
            id="particles"
            init={particlesInit}
            options={particlesOptions}
            className="absolute inset-0"
          />
        )}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};