/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#38bdf8',
        campus: {
          night: '#0f172a',
          panel: 'rgba(15, 23, 42, 0.82)',
          accent: '#38bdf8',
          quest: '#facc15',
          danger: '#fb7185',
        },
      },
    },
  },
  plugins: [],
};
