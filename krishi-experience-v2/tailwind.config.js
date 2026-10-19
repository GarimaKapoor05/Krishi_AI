/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#143325",
          green: "#1b4332",
          primary: "#2d6a4f",
          emerald: "#40916c",
          leaf: "#52b788",
          mint: "#d8f3dc",
          earth: "#7f4f24",
          clay: "#99582a",
          amber: "#d97706",
          gold: "#b45309",
          cream: "#FAF9F5",
          sand: "#F4F3EE",
          surface: "#FFFFFF",
          border: "#E7E5DC"
        }
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      boxShadow: {
        soft: "0 2px 10px -1px rgba(27, 67, 50, 0.05), 0 1px 4px -1px rgba(27, 67, 50, 0.03)",
        card: "0 10px 30px -4px rgba(27, 67, 50, 0.07), 0 4px 12px -2px rgba(27, 67, 50, 0.03)",
        elevated: "0 20px 40px -8px rgba(27, 67, 50, 0.12)",
      }
    },
  },
  plugins: [],
}
