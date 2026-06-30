/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d0f0c',
        panel: '#151812',
        lime: '#c7f36a',
        cream: '#f4eddd',
        muted: '#a5aa9e',
      },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Playfair Display', 'serif'] },
      boxShadow: { glow: '0 20px 60px rgba(199,243,106,.12)' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(18px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: { rise: 'rise .65s ease-out both' },
    },
  },
  plugins: [],
}
