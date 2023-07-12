/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'black-rgba': 'rgba(0, 0, 0, 0.95)',
      },
      animation: {
        fade: 'fadeOut forwards 0.5s ease-in-out',
      },

      // that is actual animation
      keyframes: () => ({
        fadeOut: {
          '0%': { opacity: 1, tasnform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.8)' },
        },
      }),
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['coffee', 'night'],
  },
};
