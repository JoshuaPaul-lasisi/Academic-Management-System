/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50:  '#fdf3f5',
          100: '#fbe8eb',
          200: '#f5c5cd',
          300: '#eda3ae',
          400: '#de6275',
          500: '#cf243d',
          600: '#ba2037',
          700: '#8B1A2F',
          800: '#751628',
          900: '#601220',
          950: '#3d0b18',
        },
        gold: {
          50:  '#fdf9ee',
          100: '#fbf3dd',
          200: '#f6e5b6',
          300: '#f1d78e',
          400: '#e8c054',
          500: '#C9A84C',
          600: '#b5953c',
          700: '#967c32',
          800: '#77632a',
          900: '#604f22',
          950: '#3a2f14',
        },
        cream: '#FDF8F0',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(139,26,47,0.08), 0 1px 2px rgba(139,26,47,0.06)',
      }
    },
  },
  plugins: [],
}
