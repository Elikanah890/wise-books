import type { AdminUser, DashboardData, RevenueData } from '../types/admin';
import { api } from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: AdminUser }>('/auth/login', { email, password }),
  me: () => api.get<AdminUser>('/auth/me', true),
  updateProfile: (input: { name?: string; email?: string; currentPassword: string }) =>
    api.patch<AdminUser>('/auth/profile', input, true),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ changed: boolean }>('/auth/change-password', { currentPassword, newPassword }, true),
};

export const adminApi = {
  dashboard: () => api.get<DashboardData>('/admin/dashboard', true),
  revenue: () => api.get<RevenueData>('/admin/revenue', true),
};
