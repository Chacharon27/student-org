/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bbd0ff',
          300: '#8fb1ff',
          400: '#5d87ff',
          500: '#3a63f5',
          600: '#2645d8',
          700: '#1f37ad',
          800: '#1d3289',
          900: '#1c2e6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
