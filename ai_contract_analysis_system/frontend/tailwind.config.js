/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",      // neon purple
        secondary: "#3b82f6",    // electric blue
        bgDark: "#030712",
        cardDark: "rgba(255,255,255,0.05)"
      },
      boxShadow: {
        glow: "0 0 25px rgba(124,58,237,0.6)"
      }
    },
  },
  plugins: [],
}
