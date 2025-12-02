import React, { useMemo, useCallback } from 'react';
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

  const showParticles = (prefs.enableParticles ?? true) && (prefs.particlesIntensity ?? 40) > 0;
  
  const speedValue =
    prefs.animationSpeed === 'slow' ? 0.2 :
    prefs.animationSpeed === 'fast' ? 2 :
    0.9;

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  const particlesOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      particles: {
        number: { value: showParticles ? (prefs.particlesIntensity || 40) : 0 },
        color: { value: ['#A855F7', '#EC4899', '#3B82F6'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: { min: 1, max: 3 }, random: true },
        move: { enable: showParticles, speed: speedValue, random: true },
      },
      interactivity: { 
        events: { 
          onHover: { enable: true, mode: 'grab' },
          onClick: { enable: true, mode: 'push' }
        }
      },
      background: { color: { value: "transparent" } },
    }),
    [prefs.particlesIntensity, prefs.enableParticles, speedValue, showParticles]
  );

  if (loading) return null;

  const glowClass =
    prefs.enableBackgroundAnimations
      ? prefs.glowLevel === 'high'
        ? 'animate-glow-high'
        : prefs.glowLevel === 'low'
        ? 'animate-glow-low'
        : 'animate-glow-medium'
      : '';

  return (
    <div className={cn('min-h-screen w-full', className)}>
      <div className="fixed inset-0 z-[-1]">
        {prefs.enableBackgroundAnimations && prefs.enableParticles ? (
          <video
            className="w-full h-full object-cover"
            src="/backgrounds/animate-bg.webp"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : null}
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${prefs.background})` }}
        />
        {showParticles && (
          <Particles
            id="tsparticles"
            className="absolute inset-0 pointer-events-none"
            init={particlesInit}
            options={particlesOptions as any}
          />
        )}
      </div>
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};