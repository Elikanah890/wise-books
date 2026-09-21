import type { SiteSettings } from '../types/settings';
import { api } from './client';

export const settingsApi = {
  get: () => api.get<SiteSettings>('/settings'),
};

export const adminSettingsApi = {
  get: () => api.get<SiteSettings>('/admin/settings', true),
  update: (data: SiteSettings) => api.put<SiteSettings>('/admin/settings', data, true),
};
