import { create } from 'zustand';
import { updateStatusBarForTheme } from '../services/mobileInit';
import { isNative } from '../services/platform';

type Theme = 'dark' | 'light' | 'contrast';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (isNative) {
      updateStatusBarForTheme(theme);
    }
    set({ theme });
  },
}));
