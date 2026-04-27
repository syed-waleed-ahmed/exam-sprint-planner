/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: '#0B1220',
        surface: '#111A2B',
        primary: '#2563EB',
        secondary: '#0F766E',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: '#E6EDF5',
        muted: '#9AA4B2',
      },
      borderRadius: {
        card: '12px',
        elem: '8px',
      },
      transitionDuration: {
        200: '200ms',
      },
      boxShadow: {
        glow: '0 10px 40px rgba(37, 99, 235, 0.28)',
      },
    },
  },
  plugins: [],
};
