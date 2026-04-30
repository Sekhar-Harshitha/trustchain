/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#7C4DFF',
        teal: '#00BCD4',
        danger: '#FF5252',
        warning: '#FFB300',
        success: '#00E676',
        'text-primary': '#1A1A2E',
        'text-secondary': '#4A4A6A',
      },
    },
  },
  plugins: [],
}
