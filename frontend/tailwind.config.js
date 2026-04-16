/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: { DEFAULT: '#0f4c27', dark: '#0a3318', light: '#1a6b3a' },
      },
    },
  },
  plugins: [],
};
