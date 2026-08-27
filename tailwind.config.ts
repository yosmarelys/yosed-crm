import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'SF Pro Text'",
          "Inter",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        canvas: {
          DEFAULT: "#f5f5f7",
          dark: "#0b0b0e",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#161619",
        },
        ink: {
          DEFAULT: "#1d1d1f",
          dim: "#6e6e73",
          dark: "#f5f5f7",
        },
        brand: {
          50: "#eef4ff",
          100: "#dbe8ff",
          200: "#b7d1ff",
          300: "#8ab2ff",
          400: "#5b8dff",
          500: "#3366ff",
          600: "#2450e0",
          700: "#1c3fb8",
          800: "#1a3591",
          900: "#193075",
        },
        accent: {
          pink: "#ff5c8a",
          teal: "#14b8a6",
          amber: "#f5a623",
          violet: "#8b5cf6",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.12)",
        card: "0 1px 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.06)",
        popover: "0 12px 40px -8px rgba(0,0,0,0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
