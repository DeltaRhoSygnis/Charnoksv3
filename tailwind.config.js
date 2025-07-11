/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
        'text-primary': '#ffffff',
        'text-on-primary': '#ffffff',
        'background-primary': '#121212',
        'background-secondary': '#1e1e1e'
      }
    }
  },
  plugins: []
}
