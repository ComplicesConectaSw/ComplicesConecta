// src/hooks/useBgMode.ts
import { create, type StateCreator } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';

type Mode = 'static' | 'particles' | 'video';

interface BgState {
  mode: Mode;
  reducedMotion: boolean;
  setMode: (mode: Mode) => void;
  toggleReducedMotion: () => void;
}

type BgModePersist = PersistOptions<BgState>;

const bgModeStore: StateCreator<BgState, [], []> = (set) => ({
  mode: 'particles',
  reducedMotion: false,
  setMode: (mode: Mode) => set({ mode }),
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
});

export const useBgMode = create<BgState>()(
  persist<BgState>(bgModeStore, { name: 'bg-mode-v2' } satisfies BgModePersist)
);