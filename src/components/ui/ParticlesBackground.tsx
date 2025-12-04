import React from 'react';
import { cn } from '@/shared/lib/cn';
import { useBgMode } from '@/hooks/useBgMode';

interface ParticlesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ children, className }) => {
  const { mode, setMode, reducedMotion, toggleReducedMotion } = useBgMode();

  return (
    <div className={cn('min-h-screen w-full', className)}>
      {children}

      <div className="grid grid-cols-3 gap-3 mt-6">
        <button
          type="button"
          onClick={() => setMode('static')}
          className={`p-3 rounded-lg ${mode === 'static' ? 'bg-purple-600' : 'bg-gray-800'}`}
        >
          Fondo Fijo
        </button>
        <button
          type="button"
          onClick={() => setMode('particles')}
          className={`p-3 rounded-lg ${mode === 'particles' ? 'bg-purple-600' : 'bg-gray-800'}`}
        >
          Partículas
        </button>
        <button
          type="button"
          onClick={() => setMode('video')}
          className={`p-3 rounded-lg ${mode === 'video' ? 'bg-purple-600' : 'bg-gray-800'}`}
        >
          Animado MP4
        </button>
      </div>

      <label className="flex items-center gap-3 mt-4">
        <input type="checkbox" checked={reducedMotion} onChange={toggleReducedMotion} />
        <span>Movimiento Reducido</span>
      </label>
    </div>
  );
};