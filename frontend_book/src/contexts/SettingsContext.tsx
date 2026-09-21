import { create } from 'zustand';
import { settingsApi } from '../api/settings';
import type { SiteSettings } from '../types/settings';

interface SettingsState {
  settings: SiteSettings | null;
  load: () => Promise<void>;
  setSettings: (settings: SiteSettings) => void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  load: async () => {
    if (get().settings) return;
    try {
      const settings = await settingsApi.get();
      set({ settings });
    } catch {
      // Keep null; components fall back to their own defaults.
    }
  },
}));
