/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Couleurs principales marocaines
        primary: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc0c0',
          300: '#ff8f8f',
          400: '#f85555',
          500: '#C1272D', // Rouge drapeau marocain
          600: '#9e1f24',
          700: '#7e181d',
          800: '#631417',
          900: '#4a1013',
        },
        // Vert drapeau marocain
        morocco: {
          50:  '#e8f5ee',
          100: '#c5e6d3',
          200: '#8fcbab',
          300: '#52ad80',
          400: '#1e9257',
          500: '#006233', // Vert drapeau marocain
          600: '#004f29',
          700: '#003c1f',
          800: '#002914',
          900: '#00160a',
        },
        // Or/Safran marocain
        gold: {
          50:  '#fefbec',
          100: '#fdf3c8',
          200: '#fbe48d',
          300: '#f9d050',
          400: '#f7bc20',
          500: '#D4890A', // Safran / Or marocain
          600: '#a86508',
          700: '#7d4a07',
          800: '#5c3606',
          900: '#3d2404',
        },
        // Fond — piloté par variables CSS (light/dark)
        dark: {
          900: 'var(--bg-900)',
          800: 'var(--bg-800)',
          700: 'var(--bg-700)',
          600: 'var(--bg-600)',
          500: 'var(--bg-500)',
          400: 'var(--bg-400)',
        },
      },
      fontFamily: {
        sans:    ['Cairo', 'system-ui', 'sans-serif'],
        heading: ['Amiri', 'Georgia', 'serif'],
        display: ['Amiri', 'Georgia', 'serif'],
      },
      backgroundImage: {
        // Motif zellige géométrique marocain
        'zellige': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30Z' fill='none' stroke='%23C1272D' stroke-width='0.4' opacity='0.15'/%3E%3Cpath d='M30 10 L50 30 L30 50 L10 30Z' fill='none' stroke='%23D4890A' stroke-width='0.3' opacity='0.1'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23C1272D' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'moroccan': '0 4px 20px rgba(193, 39, 45, 0.15)',
        'gold':     '0 4px 20px rgba(212, 137, 10, 0.2)',
      },
    },
  },
  plugins: [],
};
