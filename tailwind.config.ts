import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        muted: "#64748B",
        faint: "#94A3B8",
        paper: "#F8FAFC",
        surface: "#F1F5F9",
        primary: "#34538C",
        "primary-dark": "#26406E",
        "primary-soft": "#EEF2F8",
        accent: "#C8843C",
        "accent-soft": "#F6EEE3",
        mist: "#E2E8F0"
      }
    }
  },
  plugins: []
};

export default config;
