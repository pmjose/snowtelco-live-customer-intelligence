/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '.dark-ops'],
  theme: {
    extend: {
      colors: {
        vfRed: {
          DEFAULT: '#29B5E8',
          dark: '#11567F',
          soft: '#E0F4FB',
        },
        ink: {
          DEFAULT: '#111111',
          soft: '#1f2937',
          muted: '#4b5563',
        },
        mist: {
          DEFAULT: '#f7f7f7',
          dark: '#eaeaea',
        },
        amber: { DEFAULT: '#F59E0B' },
        ok: { DEFAULT: '#10B981' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,17,0.04), 0 4px 12px rgba(17,17,17,0.06)',
        elev: '0 4px 24px rgba(17,17,17,0.08)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(41,181,232,0.45)' },
          '50%': { boxShadow: '0 0 0 14px rgba(41,181,232,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};
