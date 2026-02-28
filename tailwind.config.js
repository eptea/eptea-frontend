/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // O segredo está aqui: ele olha TUDO dentro de src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}