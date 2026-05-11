import { create } from 'zustand';
import { colors, ThemeColors } from '../theme/colors';

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  currentColors: ThemeColors;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark', // Par défaut sur dark comme demandé
  currentColors: colors.dark,
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme, currentColors: colors[newTheme] });
  },
  setTheme: (newTheme: Theme) => {
    set({ theme: newTheme, currentColors: colors[newTheme] });
  }
}));

// Ré-export des couleurs pour la compatibilité avec l'ancien code s'il y a des imports directs
export { colors };
