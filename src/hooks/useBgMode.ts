// src/hooks/useBgMode.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mode = 'static' | 'particles' | 'video';
export type BackgroundMode = Mode;

interface BgState {
  mode: Mode;
  reducedMotion: boolean;
  setMode: (mode: Mode) => void;
  toggleReducedMotion: () => void;
}

export const useBgMode = create<BgState>()(
  persist(
    (set) => ({
      mode: 'particles' as Mode,
      reducedMotion: false,
      setMode: (mode) => set({ mode }),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
    }),
    { name: 'bg-mode-v2' }
  )
);