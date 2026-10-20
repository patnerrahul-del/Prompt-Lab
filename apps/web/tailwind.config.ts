import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        elevated: 'var(--elevated)',
        border: 'var(--border)',
        'text-ivory': 'var(--text-ivory)',
        'text-muted': 'var(--text-muted)',
        gold: {
          light: '#E8D8A8',
          DEFAULT: '#C9A24B',
          dark: '#8A6A22',
          glow: 'rgba(201, 162, 75, 0.25)',
        },
        champagne: '#E8D8A8',
        obsidian: '#0A0A0B',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 0 15px rgba(201, 162, 75, 0.15)',
        'gold-md': '0 0 25px rgba(201, 162, 75, 0.25)',
        'gold-lg': '0 0 40px rgba(201, 162, 75, 0.35)',
        luxury: '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(201, 162, 75, 0.2)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E8D8A8 0%, #C9A24B 50%, #8A6A22 100%)',
        'gold-gradient-radial': 'radial-gradient(circle at center, #E8D8A8 0%, #C9A24B 60%, #8A6A22 100%)',
        'dark-luxury': 'linear-gradient(180deg, #121214 0%, #0A0A0B 100%)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'gold-shimmer': 'gold-shimmer 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
