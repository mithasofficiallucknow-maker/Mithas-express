import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        navy: "#0F172A",
        steel: "#4682B4",
        teal: "#0F766E",
        mint: "#A7F3D0",
        lavender: "#C4B5FD",
        softorange: "#FB923C",
        offwhite: "#F8FAFC",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
