import { logger } from '@/lib/logger';
// Session storage utilities - only for UI flags and temporary data
// Profile data should use React Query + Supabase

interface SessionFlags {
  animationsEnabled?: boolean;
  sidebarCollapsed?: boolean;
  theme?: 'light' | 'dark' | 'system';
  lastVisitedPage?: string;
  onboardingCompleted?: boolean;
  tutorialStep?: number;
}

const SESSION_KEYS = {
  UI_FLAGS: 'complices_ui_flags',
  TEMP_FORM_DATA: 'complices_temp_form',
  NAVIGATION_STATE: 'complices_nav_state',
} as const;

export const sessionStorage = {
  // UI Flags
  getUIFlags: (): SessionFlags => {
    try {
      const stored = localStorage.getItem(SESSION_KEYS.UI_FLAGS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  setUIFlags: (flags: Partial<SessionFlags>) => {
    try {
      const current = sessionStorage.getUIFlags();
      const updated = { ...current, ...flags };
      localStorage.setItem(SESSION_KEYS.UI_FLAGS, JSON.stringify(updated));
    } catch (error) {
      logger.warn('Failed to save UI flags:', { error: String(error) });
    }
  },

  // Temporary form data (for multi-step forms)
  getTempFormData: <T = any>(key: string): T | null => {
    try {
      const stored = localStorage.getItem(`${SESSION_KEYS.TEMP_FORM_DATA}_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setTempFormData: <T = any>(key: string, data: T) => {
    try {
      localStorage.setItem(`${SESSION_KEYS.TEMP_FORM_DATA}_${key}`, JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to save temp form data:', { error: String(error) });
    }
  },

  clearTempFormData: (key: string) => {
    try {
      localStorage.removeItem(`${SESSION_KEYS.TEMP_FORM_DATA}_${key}`);
    } catch (error) {
      logger.warn('Failed to clear temp form data:', { error: String(error) });
    }
  },

  // Navigation state
  getNavigationState: () => {
    try {
      const stored = localStorage.getItem(SESSION_KEYS.NAVIGATION_STATE);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  setNavigationState: (state: any) => {
    try {
      localStorage.setItem(SESSION_KEYS.NAVIGATION_STATE, JSON.stringify(state));
    } catch (error) {
      logger.warn('Failed to save navigation state:', { error: String(error) });
    }
  },

  // Clear all session data
  clearAll: () => {
    try {
      Object.values(SESSION_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      // Clear temp form data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(SESSION_KEYS.TEMP_FORM_DATA)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      logger.error('Error getting session storage item:', { error: String(error) });
    }
  },
};
