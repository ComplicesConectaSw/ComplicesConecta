import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Theme, NavbarStyle } from '@/hooks/useProfileTheme';
import { logger } from '@/lib/supabase-logger';

interface ThemePreferences {
  preferred_theme: Theme;
  navbar_style: NavbarStyle;
  theme_updated_at?: string;
}

/**
 * Hook para manejar persistencia de temas en Supabase para usuarios de producción
 */
export const useSupabaseTheme = () => {
  const { user } = useAuth();
  const [userTheme, setUserTheme] = useState<Theme>('dark');
  const [navbarStyle, setNavbarStyle] = useState<NavbarStyle>('solid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar preferencias de tema desde Supabase
  const loadThemePreferences = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('preferred_theme, navbar_style, theme_updated_at')
        .eq('id', user.id)
        .single() as { data: ThemePreferences | null, error: any };

      if (fetchError) {
        logger.error('Error loading theme preferences', {
          error: fetchError.message,
          userId: user.id
        });
        setError('Error al cargar preferencias de tema');
        return;
      }

      if (data) {
        setUserTheme(data.preferred_theme || 'dark');
        setNavbarStyle(data.navbar_style || 'solid');
        
        logger.info('Preferencias de tema cargadas', {
          userId: user.id,
          theme: data.preferred_theme,
          navbarStyle: data.navbar_style,
          lastUpdated: data.theme_updated_at
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      logger.error('Failed to load theme preferences', {
        error: errorMessage,
        userId: user?.id
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Guardar preferencias de tema en Supabase
  const saveThemePreferences = useCallback(async (theme: Theme, navbar: NavbarStyle) => {
    if (!user?.id) {
      logger.warn('Attempted to save theme without authenticated user');
      return false;
    }

    try {
      const updateData = {
        preferred_theme: theme,
        navbar_style: navbar,
        theme_updated_at: new Date().toISOString()
      };

      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        logger.error('Error saving theme preferences', {
          error: updateError.message,
          userId: user.id,
          theme,
          navbar
        });
        setError('Error al guardar preferencias de tema');
        return false;
      }

      logger.info('Theme preferences saved', {
        userId: user.id,
        theme,
        navbar,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      logger.error('Failed to save theme preferences', {
        error: errorMessage,
        userId: user?.id,
        theme,
        navbar
      });
      setError(errorMessage);
      return false;
    }
  }, [user?.id]);

  // Actualizar tema con persistencia
  const updateUserTheme = useCallback(async (newTheme: Theme) => {
    setUserTheme(newTheme);
    const success = await saveThemePreferences(newTheme, navbarStyle);
    if (!success) {
      // Revertir en caso de error
      logger.warn('Reverting theme change due to save failure');
    }
  }, [navbarStyle, saveThemePreferences]);

  // Actualizar estilo de navbar con persistencia
  const updateNavbarStyle = useCallback(async (newStyle: NavbarStyle) => {
    setNavbarStyle(newStyle);
    const success = await saveThemePreferences(userTheme, newStyle);
    if (!success) {
      // Revertir en caso de error
      logger.warn('Reverting navbar style change due to save failure');
    }
  }, [userTheme, saveThemePreferences]);

  // Cargar preferencias al montar el componente o cambiar usuario
  useEffect(() => {
    loadThemePreferences();
  }, [loadThemePreferences]);

  // Suscribirse a cambios en tiempo real (opcional)
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('theme_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          const newData = payload.new as ThemePreferences;
          if (newData.preferred_theme) {
            setUserTheme(newData.preferred_theme);
          }
          if (newData.navbar_style) {
            setNavbarStyle(newData.navbar_style);
          }
          
          logger.info('Theme preferences updated via real-time', {
            userId: user.id,
            theme: newData.preferred_theme,
            navbar: newData.navbar_style
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return {
    userTheme,
    setUserTheme: updateUserTheme,
    navbarStyle,
    setNavbarStyle: updateNavbarStyle,
    isLoading,
    error,
    refreshTheme: loadThemePreferences
  };
};
