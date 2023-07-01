/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
    themes: ['coffee'],
  },
}
