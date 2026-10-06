import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          green: "#d7dee8",
          purple: "#7eb6ff",
        },
        ltc: {
          silver: "#d5dbe3",
          blue: "#6ea8ff",
          ink: "#8fa4c4",
        },
        ink: {
          950: "#07080c",
          900: "#0c0e14",
          800: "#12151d",
          700: "#1b2030",
        },
      },
      boxShadow: {
        "glow-green": "0 0 24px rgba(213,219,227,0.28)",
        "glow-purple": "0 0 24px rgba(110,168,255,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
