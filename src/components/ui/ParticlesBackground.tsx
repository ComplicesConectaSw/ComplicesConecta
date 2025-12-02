// src/components/ui/ParticlesBackground.tsx
import React, { useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/shared/lib/cn';

interface ParticlesBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ children, className }) => {
  const { prefs, loading } = useTheme();

  const particlesInit = async (main: unknown) => {
    await loadFull(main as any);
  };

  const particlesOptions = useMemo(
    () => ({
      particles: {
        number: { value: prefs.particlesIntensity },
        color: { value: ['#00FFFF', '#FF00FF'] }, // Neón cyan-magenta
        shape: { type: 'circle' },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } },
        move: { enable: true, speed: 1, random: true },
      },
      interactivity: { events: { onHover: { enable: true, mode: 'repulse' } } },
      retina_detect: true,
    }),
    [prefs.particlesIntensity]
  );

  if (loading) return <div>Cargando tema...</div>;

  const glowClass =
    prefs.glowLevel === 'high'
      ? 'animate-glow-high'
      : prefs.glowLevel === 'low'
      ? 'animate-glow-low'
      : 'animate-glow-medium';

  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${prefs.background})` }}
      />
      {/* Glow overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20',
          glowClass
        )}
      />
      {/* Partículas */}
      <Particles id="particles" init={particlesInit} options={particlesOptions} className="absolute inset-0" />
      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
