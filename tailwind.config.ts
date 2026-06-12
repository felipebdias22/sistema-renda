import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0A0F1E",
        foreground: "#E8EDF7",
        navy: {
          950: "#070B17",
          900: "#0A0F1E",
          850: "#0D1428",
          800: "#111A33",
          700: "#172240",
          600: "#1F2D52",
        },
        brand: {
          DEFAULT: "#5B8DEF",
          400: "#7AA5F5",
          500: "#5B8DEF",
          600: "#3F6FD6",
        },
        accent: {
          green: "#3FE08F",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(0,0,0,0.5)",
        glow: "0 0 32px -4px rgba(91,141,239,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
