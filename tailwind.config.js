/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: '#0F172A',
        surface: '#1E293B',
        primary: '#7C3AED',
        secondary: '#06B6D4',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: '#F8FAFC',
        muted: '#94A3B8',
      },
      borderRadius: {
        card: '12px',
        elem: '8px',
      },
      transitionDuration: {
        200: '200ms',
      },
      boxShadow: {
        glow: '0 10px 40px rgba(124, 58, 237, 0.35)',
      },
    },
  },
  plugins: [],
};
