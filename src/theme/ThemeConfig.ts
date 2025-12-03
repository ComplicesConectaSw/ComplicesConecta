import { Capacitor } from '@capacitor/core';

const normalize = (relativePath: string) => relativePath.replace(/^\/+/, '');

export const getAssetPath = (relativePath: string): string => {
  const normalized = normalize(relativePath);
  const base = Capacitor.isNativePlatform() ? 'assets' : '/assets';
  return `${base}/${normalized}`;
};

export const ThemeConfig = {
  palette: {
    primary: '#7c3aed',
    secondary: '#2563eb',
    accent: '#06b6d4',
    glassGradient: 'from-purple-600/80 via-indigo-600/70 to-blue-600/80',
    dangerGradient: 'from-red-500 via-rose-500 to-orange-500',
    surface: '#0f172a',
    background: '#05010f',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
  },
  backgrounds: {
    hero: getAssetPath('backgrounds/bg1.jpg'),
    dashboard: getAssetPath('backgrounds/bg5.webp'),
    modal: getAssetPath('backgrounds/animate-bg.webp'),
    profiles: {
      single: {
        male: getAssetPath('backgrounds/single-male.webp'),
        female: getAssetPath('backgrounds/single-female.webp'),
        default: getAssetPath('backgrounds/default-neon.webp'),
      },
      couple: {
        heterosexual: getAssetPath('backgrounds/couple-mf.webp'),
        lgbtq: getAssetPath('backgrounds/couple-mm-ff.webp'),
        default: getAssetPath('backgrounds/bg3.jpg'),
      },
    },
  },
  blurClasses: {
    glassPanel: 'backdrop-blur-2xl bg-white/5 border border-white/10',
    lockedOverlay: 'backdrop-blur-md bg-black/60 border border-white/10',
  },
  statusGradients: {
    soft: 'from-emerald-400/80 via-emerald-500/80 to-green-500/80',
    normal: 'from-amber-400/80 via-amber-500/80 to-orange-500/80',
    strict: 'from-rose-500/80 via-red-500/80 to-red-600/80',
  },
} as const;
