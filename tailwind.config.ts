import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          green: "#00ff9d",
          purple: "#a855f7",
        },
        ink: {
          950: "#05050a",
          900: "#0a0a12",
          800: "#11111c",
          700: "#1a1a2a",
        },
      },
      boxShadow: {
        "glow-green": "0 0 24px rgba(0,255,157,0.35)",
        "glow-purple": "0 0 24px rgba(168,85,247,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
