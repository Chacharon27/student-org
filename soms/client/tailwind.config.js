/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf0fb',
          100: '#f6d9f1',
          200: '#ebadef',
          300: '#d552a3',
          400: '#b5428c',
          500: '#831c91',
          600: '#6d1b78',
          700: '#462c7d',
          800: '#371f60',
          900: '#2b1c4b',
        },
        accent: {
          50: '#fff0f8',
          100: '#ffd7ee',
          200: '#ffb3db',
          300: '#ff8cc3',
          400: '#ff70bf',
          500: '#dd4d9d',
          600: '#bc3b85',
          700: '#9d2f6d',
          800: '#7f2556',
          900: '#62203f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 60px -26px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};
