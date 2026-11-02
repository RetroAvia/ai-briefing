import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#08090d',
        panel: '#11131c',
        'panel-light': '#181b28',
        'violet-accent': '#7c3aed',
        'cyan-accent': '#06b6d4',
        'emerald-accent': '#10b981',
      },
      backgroundImage: {
        'neon-violet': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'neon-cyan': 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
        'neon-emerald': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'mesh-glow': 'radial-gradient(at 0% 0%, rgba(124,58,237,0.18) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(6,182,212,0.15) 0, transparent 50%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'slide-in': 'slide-in 0.35s ease-out forwards',
        'fade-in': 'fade-in 0.25s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.9', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.25)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'neon-violet': '0 0 25px rgba(124, 58, 237, 0.45), 0 0 50px rgba(124, 58, 237, 0.15)',
        'neon-cyan': '0 0 25px rgba(6, 182, 212, 0.45), 0 0 50px rgba(6, 182, 212, 0.15)',
        'neon-emerald': '0 0 25px rgba(16, 185, 129, 0.45), 0 0 50px rgba(16, 185, 129, 0.15)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
