import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        paper: '#fbfbfd',
        ink: '#10152b',
        'ink-soft': '#2a3050',
        royal: {
          DEFAULT: '#1d2f8f',
          light: '#2c44b8',
          deep: '#131f66',
        },
        gold: {
          DEFAULT: '#b8912f',
          soft: '#e6d6a3',
        },
        success: '#1a8a5f',
        danger: '#c04444',
      },
      fontFamily: {
        body: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Iowan Old Style', 'serif'],
      },
      borderRadius: {
        s: '10px',
        m: '16px',
        l: '24px',
        xl: '32px',
      },
      boxShadow: {
        s: '0 2px 8px rgba(16,21,43,0.06)',
        m: '0 10px 30px rgba(16,21,43,0.08)',
        l: '0 24px 60px rgba(16,21,43,0.14)',
        gold: '0 8px 24px rgba(184,145,47,0.28)',
      },
    },
  },
  plugins: [],
} satisfies Config;
