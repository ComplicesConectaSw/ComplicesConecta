import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';
import { cn } from '@/shared/lib/cn';
import { useBgMode } from '@/hooks/useBgMode';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/features/auth/useAuth';
import { useAnimation } from '@/components/animations/AnimationProvider';

interface ParticlesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ children, className }) => {
  const { prefs } = useTheme();
  const { profile } = useAuth();
  const { mode } = useBgMode();
  const { config } = useAnimation();

  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    void initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  const particlesOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: { enable: true, mode: 'push' },
          onHover: { enable: true, mode: 'grab' },
        },
        modes: {
          push: { quantity: 4 },
          grab: { distance: 140, links: { opacity: 0.4 } },
        },
      },
      particles: {
        color: { value: '#a855f7' },
        links: {
          color: '#d8b4fe',
          distance: 150,
          enable: true,
          opacity: 0.25,
          width: 1,
        },
        move: {
          direction: 'none' as const,
          enable: true,
          outModes: { default: 'bounce' as const },
          random: false,
          // Ajustar velocidad según reducedMotion global
          speed: config.reducedMotion ? 0.4 : 1.4,
          straight: false,
        },
        number: {
          density: { enable: true, area: 800 },
          value: profile?.is_premium ? 120 : 70,
        },
        opacity: { value: 0.45 },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    }),
    [config.reducedMotion, profile?.is_premium]
  );

  const finalMode = mode;
  const showVideo = finalMode === 'video';
  const showParticles = config.enableParticles && !config.reducedMotion && finalMode !== 'static';
  const videoSrc = profile?.profile_type === 'couple'
    ? '/backgrounds/Animate-bg2.mp4'
    : '/backgrounds/animate-bg.mp4';

  return (
    <div className={cn('min-h-screen w-full relative', className)}>
      {/* VIDEO DE FONDO ANIMADO */}
      {showVideo && (
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

      {/* FONDO ESTÁTICO (solo si no hay video) */}
      {!showVideo && (
        <div
          className="fixed inset-0 -z-50 bg-cover bg-center"
          style={{ backgroundImage: `url(${prefs.background})` }}
        />
      )}

      {/* PARTÍCULAS */}
      {engineReady && showParticles && (
        <Particles
          id="tsparticles"
          options={{
            ...particlesOptions,
            fullScreen: { enable: true, zIndex: -1 },
            particles: {
              ...particlesOptions.particles,
              number: { value: profile?.is_premium ? 120 : 70 },
            },
          }}
          className="fixed inset-0 pointer-events-none"
        />
      )}

      {/* GLOW + LOGO VIP */}
      <div className="fixed inset-0 -z-40 bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      {profile?.is_premium && showVideo && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <video autoPlay loop muted playsInline className="w-64 opacity-30">
            <source src="/backgrounds/logo-animated.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="relative z-20 min-h-screen">
        {children}
      </div>
    </div>
  );
};