/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff8c00',
        secondary: '#0040df',
        tertiary: '#00c853',
        surface: '#fff8f5',
        'surface-dim': '#ead6c9',
        'surface-container': '#ffeadd',
        'on-surface': '#241912',
        'on-surface-variant': '#564334',
        outline: '#897362',
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'vivid': '0 4px 20px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}