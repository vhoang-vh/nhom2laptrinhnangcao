/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 50: "#f0fdfa", 600: "#0d9488", 700: "#0f766e", 900: "#134e4a" } },
      boxShadow: { card: "0 12px 36px rgba(15, 23, 42, .07)" },
    },
  },
  plugins: [],
};
