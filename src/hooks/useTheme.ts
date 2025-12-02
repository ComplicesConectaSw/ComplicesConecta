// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface ThemePrefs {
  background: string;
  particlesIntensity: number;  // 0-100
  glowLevel: 'low' | 'medium' | 'high';
  isCustom: boolean;
  enableParticles: boolean;
  enableBackgroundAnimations: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  enableGlassUI: boolean;
}

const defaultPrefs: ThemePrefs = {
  background: '/backgrounds/default-neon.webp',
  particlesIntensity: 50,
  glowLevel: 'medium',
  isCustom: false,
  enableParticles: true,
  enableBackgroundAnimations: true,
  animationSpeed: 'normal',
  enableGlassUI: true,
};

export const useTheme = () => {
  const { user, isDemo } = useAuth();

  const [prefs, setPrefs] = usePersistedState<ThemePrefs>('user_theme', defaultPrefs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shouldSkip = !user || isDemo;

    if (shouldSkip) {
      setLoading(false);
      return;
    }

    // Fetch desde Supabase (solo si hay cliente y user.id)
    const fetchTheme = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_themes' as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          const theme = data as {
            bg_url?: string;
            particles_intensity?: number;
            glow_level?: 'low' | 'medium' | 'high';
            enable_particles?: boolean;
            enable_background_animations?: boolean;
            animation_speed?: 'slow' | 'normal' | 'fast';
            enable_glass_ui?: boolean;
          };
          setPrefs({
            background: theme.bg_url || defaultPrefs.background,
            particlesIntensity: theme.particles_intensity ?? defaultPrefs.particlesIntensity,
            glowLevel: theme.glow_level || defaultPrefs.glowLevel,
            isCustom: true,
            enableParticles: theme.enable_particles ?? defaultPrefs.enableParticles,
            enableBackgroundAnimations:
              theme.enable_background_animations ?? defaultPrefs.enableBackgroundAnimations,
            animationSpeed: theme.animation_speed || defaultPrefs.animationSpeed,
            enableGlassUI: theme.enable_glass_ui ?? prefs.enableGlassUI ?? defaultPrefs.enableGlassUI,
          });

          logger.info('Tema cargado de DB', { userId: user.id });
        }
      } catch (error) {
        logger.error('Error cargando tema', { error });
      } finally {
        setLoading(false);
      }
    };

    void fetchTheme();

    // Realtime subscription (solo si VIP y supabase disponible)
    if ((user as any)?.is_premium && supabase) {
      const channel = supabase
        .channel('user_themes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_themes', filter: `user_id=eq.${user.id}` } as any,
          (payload: any) => {
            const theme = payload.new as {
              bg_url?: string;
              particles_intensity?: number;
              glow_level?: 'low' | 'medium' | 'high';
              enable_particles?: boolean;
              enable_background_animations?: boolean;
              animation_speed?: 'slow' | 'normal' | 'fast';
              enable_glass_ui?: boolean;
            };
            setPrefs({
              background: theme.bg_url || defaultPrefs.background,
              particlesIntensity: theme.particles_intensity ?? defaultPrefs.particlesIntensity,
              glowLevel: theme.glow_level || defaultPrefs.glowLevel,
              isCustom: true,
              enableParticles: theme.enable_particles ?? defaultPrefs.enableParticles,
              enableBackgroundAnimations:
                theme.enable_background_animations ?? defaultPrefs.enableBackgroundAnimations,
              animationSpeed: theme.animation_speed || defaultPrefs.animationSpeed,
              enableGlassUI: theme.enable_glass_ui ?? prefs.enableGlassUI ?? defaultPrefs.enableGlassUI,
            });
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [user, isDemo, setPrefs]);

  // Defaults basados en preferencias por defecto si no custom
  const getDefaultBg = () => {
    return defaultPrefs.background;
  };

  return {
    prefs: {
      ...prefs,
      background: prefs.isCustom ? prefs.background : getDefaultBg(),
    },
    loading,
    setPrefs,
  };
};