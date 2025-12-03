import { Capacitor, registerPlugin } from '@capacitor/core';

type SecurePreferencesPlugin = {
  set: (options: { key: string; value: string }) => Promise<void>;
  get: (options: { key: string }) => Promise<{ value?: string | null }>;
  remove: (options: { key: string }) => Promise<void>;
};

const securePlugin = registerPlugin<SecurePreferencesPlugin>('SecurePreferences');

const FALLBACK_STORAGE = typeof window !== 'undefined' ? window.sessionStorage : undefined;

export const SecureStorageService = {
  async saveToken(key: string, value: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      FALLBACK_STORAGE?.setItem(key, value);
      return;
    }

    await securePlugin.set({ key, value });
  },

  async getToken(key: string): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return FALLBACK_STORAGE?.getItem(key) ?? null;
    }

    const { value } = await securePlugin.get({ key });
    return value ?? null;
  },

  async removeToken(key: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      FALLBACK_STORAGE?.removeItem(key);
      return;
    }

    await securePlugin.remove({ key });
  },
};
