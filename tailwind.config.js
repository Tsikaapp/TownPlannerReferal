/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep forest green from the PlanLink mark.
        forest: {
          50: '#F1F7F3',
          100: '#DCEDE3',
          200: '#B9DAC7',
          300: '#8BBFA3',
          400: '#549C79',
          500: '#2C7D57',
          600: '#166342',
          700: '#0B4A2F',
          800: '#083A26',
          900: '#062A1C',
          950: '#031710',
        },
        // Gold from the PlanLink mark.
        gold: {
          50: '#FDF9EE',
          100: '#FAF0D4',
          200: '#F4DFA4',
          300: '#EBC963',
          400: '#E0B23F',
          500: '#D9A62A',
          600: '#BE8A14',
          700: '#976A11',
          800: '#7B5515',
          900: '#674715',
        },
      },
      spacing: {
        4.5: '1.125rem',
        5.5: '1.375rem',
        13: '3.25rem',
        18: '4.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(6 42 28 / 0.04), 0 1px 3px 0 rgb(6 42 28 / 0.06)',
        lift: '0 4px 12px -2px rgb(6 42 28 / 0.10), 0 2px 6px -2px rgb(6 42 28 / 0.06)',
        pop: '0 12px 32px -8px rgb(6 42 28 / 0.20), 0 4px 12px -4px rgb(6 42 28 / 0.10)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
