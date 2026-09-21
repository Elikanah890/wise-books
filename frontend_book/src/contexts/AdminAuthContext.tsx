import { create } from 'zustand';
import { authApi } from '../api/admin';
import { getAdminToken, setAdminToken, UNAUTHORIZED_EVENT } from '../api/client';
import type { AdminUser } from '../types/admin';

interface AdminAuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: AdminUser) => void;
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  token: getAdminToken(),
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  initialize: async () => {
    const token = getAdminToken();
    if (!token) {
      set({ token: null, user: null, isAuthenticated: false, isInitializing: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ token, user, isAuthenticated: true, isInitializing: false });
    } catch {
      setAdminToken(null);
      set({ token: null, user: null, isAuthenticated: false, isInitializing: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    setAdminToken(token);
    set({ token, user, isAuthenticated: true, isInitializing: false });
  },

  logout: () => {
    setAdminToken(null);
    set({ token: null, user: null, isAuthenticated: false, isInitializing: false });
  },

  updateUser: (user) => {
    set({ user });
  },
}));

// A 401 from any admin request clears the session so protected routes redirect.
window.addEventListener(UNAUTHORIZED_EVENT, () => {
  useAdminAuth.getState().logout();
});
