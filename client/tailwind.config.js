/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'black-rgba': 'rgba(0, 0, 0, 0.95)',
      },
      animation: {
        'bounce-d-sm': 'bounce 1s 0.1s infinite',
        'bounce-d-md': 'bounce 1s 0.2s infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['coffee', 'night'],
  },
};
