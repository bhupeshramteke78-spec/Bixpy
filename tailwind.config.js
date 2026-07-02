/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171713',
        panel: '#20201C',
        lime: '#557A46',
        cream: '#FDFBF7',
        muted: '#6D665D',
        terracotta: '#C85C3D',
        mustard: '#D6A629',
        amber: {
          100: '#FFF2C7',
          200: '#F3D47C',
          300: '#E6B84A',
          400: '#D6A629',
        },
        orange: {
          300: '#F5A16E',
          400: '#F47B3A',
          500: '#DB642D',
        },
      },
      fontFamily: { sans: ['Manrope', 'sans-serif'], display: ['Cormorant Garamond', 'serif'] },
      boxShadow: { glow: '7px 7px 0 #171713' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(18px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: { rise: 'rise .65s ease-out both' },
    },
  },
  plugins: [],
}
