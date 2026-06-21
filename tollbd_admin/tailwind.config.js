/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        toll: {
          green: '#006A4E',
          dark: '#004D38',
        },
      },
    },
  },
  plugins: [],
}
