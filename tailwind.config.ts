import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#08090d',
        panel: '#11131c',
        'violet-accent': '#7c3aed',
        'cyan-accent': '#06b6d4',
        'emerald-accent': '#10b981',
      },
      backgroundImage: {
        'neon-violet': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'neon-cyan': 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
        'neon-emerald': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.3)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'neon-violet': '0 0 20px rgba(124, 58, 237, 0.5), 0 0 40px rgba(124, 58, 237, 0.2)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.2)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.2)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
