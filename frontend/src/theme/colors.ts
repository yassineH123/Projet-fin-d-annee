export const colors = {
  light: {
    background: '#F9FAFB', // Très clair, presque blanc
    surface: '#FFFFFF',    // Blanc pur
    text: '#111827',       // Noir très profond pour la lisibilité
    textSecondary: '#6B7280', // Gris moyen
    primary: '#0066FF',    // Bleu électrique (startup vibe)
    primaryLight: '#E0EDFF',
    secondary: '#10B981',  // Vert émeraude
    error: '#EF4444',
    border: '#E5E7EB',
    cardShadow: 'rgba(0, 0, 0, 0.06)',
    cardShadowStrong: 'rgba(0, 0, 0, 0.12)',
    tabBarBackground: '#FFFFFF',
    transparent: 'transparent',
  },
  dark: {
    background: '#0B0D12', // Noir profond, presque Oled
    surface: '#1A1D24',    // Gris anthracite foncé
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#3B82F6',    // Bleu plus clair pour contraster sur le sombre
    primaryLight: 'rgba(59, 130, 246, 0.15)', // Bleu très léger avec opacité
    secondary: '#34D399',
    error: '#F87171',
    border: '#2A2F3A',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardShadowStrong: 'rgba(0, 0, 0, 0.6)',
    tabBarBackground: '#13151A',
    transparent: 'transparent',
  }
};

export type ThemeColors = typeof colors.light;
