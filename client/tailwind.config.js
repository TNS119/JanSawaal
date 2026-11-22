/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: "#1e3a8a",
          dark: "#0f172a",
          saffron: "#ea580c",
          green: "#15803d",
          light: "#f8fafc"
        }
      }
    },
  },
  plugins: [],
}
