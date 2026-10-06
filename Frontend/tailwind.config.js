/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "brand-green": "#1b4332",
        "brand-primary": "#2d6a4f",
        "brand-emerald": "#40916c",
        "brand-leaf": "#52b788",
        "brand-mint": "#d8f3dc",
        "brand-earth": "#7f4f24",
        "brand-amber": "#d97706",
        "brand-gold": "#b45309",
        "bg-light": "#FAF9F5",
        "bg-surface": "#FFFFFF",
        "bg-surface-soft": "#F4F3EE",
        "bg-dark": "#0d1b16",
        "text-dark": "#f8faf9",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 10px -1px rgba(27, 67, 50, 0.05), 0 1px 4px -1px rgba(27, 67, 50, 0.03)",
        card: "0 10px 30px -4px rgba(27, 67, 50, 0.07), 0 4px 12px -2px rgba(27, 67, 50, 0.03)",
        elevated: "0 20px 40px -8px rgba(27, 67, 50, 0.12)",
      },
    },
  },
  plugins: [],
};