/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        'gradient-start': '#1e3a8a',
        'gradient-end': '#ff8c00',
      },
    },
  },
  plugins: [],
}
