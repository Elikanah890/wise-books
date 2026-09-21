import { create } from 'zustand';
import { THEME_KEY } from '../utils/constants';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

const initialTheme = (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'light';
applyTheme(initialTheme);

export const useTheme = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
