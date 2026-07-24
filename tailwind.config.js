/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbfbf9',
          100: '#f6f4ed',
          200: '#ece7db',
          300: '#dbd1be',
          400: '#c3b295',
          500: '#ab9570', // Restrained gold brand accent
          600: '#988059',
          700: '#7f6a4a',
          800: '#67553c',
          900: '#544632',
          950: '#2e251a',
        },
        sidebar: {
          bg: '#141416', // Dark charcoal/slate sidebar background
          hover: '#232326',
          active: '#2a2a2e',
          text: '#a1a1aa',
          selected: '#f3f4f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
