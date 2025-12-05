// src/hooks/useBgMode.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mode = 'static' | 'particles' | 'video';
export type BackgroundMode = Mode;

type GlassMode = 'on' | 'off';
type BackgroundConfigMode = 'fixed' | 'random';

interface BgState {
  // Modo de animación/fondo (backwards compatible)
  mode: Mode;
  reducedMotion: boolean;

  // Modo visual glass global
  glassMode: GlassMode;

  // Fondo activo por perfil/contexto (clave lógica, no ruta absoluta)
  backgroundKey: string | null;
  backgroundMode: BackgroundConfigMode;

  // Setters
  setMode: (mode: Mode) => void;
  toggleReducedMotion: () => void;

  setGlassMode: (mode: GlassMode) => void;
  setBackgroundKey: (key: string | null) => void;
  setBackgroundMode: (mode: BackgroundConfigMode) => void;
}

export const useBgMode = create<BgState>()(
  persist(
    (set) => ({
      mode: 'particles' as Mode,
      reducedMotion: false,

      glassMode: 'on' as GlassMode,
      backgroundKey: null,
      backgroundMode: 'fixed' as BackgroundConfigMode,

      setMode: (mode) => set({ mode }),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

      setGlassMode: (mode) => set({ glassMode: mode }),
      setBackgroundKey: (key) => set({ backgroundKey: key }),
      setBackgroundMode: (mode) => set({ backgroundMode: mode }),
    }),
    { name: 'bg-mode-v3' }
  )
);