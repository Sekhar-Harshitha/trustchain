/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-mint': '#E8F5E9',
        'pastel-lavender': '#EDE7F6',
        'pastel-peach': '#FFF3E0',
        'pastel-sky': '#E3F2FD',
        'accent': '#7C4DFF',
        'accent-teal': '#00BCD4',
        'danger': '#FF5252',
        'warning': '#FFB300',
        'success': '#00E676',
        'text-primary': '#1A1A2E',
        'text-secondary': '#4A4A6A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
