import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6c5ce7",
          dark: "#5849c4",
          light: "#8c7efa",
          soft: "#f3f1f9",
        },
        accent: {
          DEFAULT: "#fd7062",
          dark: "#e05345",
          soft: "#fff0ee",
        },
        success: {
          DEFAULT: "#00b894",
          dark: "#009678",
          soft: "#e6f8f5",
        },
        warning: {
          DEFAULT: "#fdcb6e",
          dark: "#e0ad4c",
          soft: "#fffaf0",
        },
        ink: {
          DEFAULT: "#2d3436",
          muted: "#636e72",
          faint: "#b2bec3",
        },
        surface: {
          DEFAULT: "#f8f9fa",
          elevated: "#ffffff",
          overlay: "rgba(255, 255, 255, 0.72)",
        },
        border: {
          DEFAULT: "#ebedf0",
          hover: "#dfe6e9",
        },
      },
      borderRadius: {
        card: "24px",
        btn: "14px",
        input: "15px",
        badge: "10px",
      },
      boxShadow: {
        card: "0 10px 30px -14px rgba(108, 92, 231, 0.18)",
        "card-hover": "0 24px 44px -18px rgba(108, 92, 231, 0.34)",
        btn: "0 10px 22px -8px rgba(108, 92, 231, 0.55)",
        "btn-hover": "0 14px 28px -10px rgba(108, 92, 231, 0.65)",
        nav: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        hero: "0 26px 50px -18px rgba(108, 92, 231, 0.55)",
        "hero-hover": "0 34px 60px -20px rgba(108, 92, 231, 0.62)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.35)" },
        },
        progressFill: {
          "0%": { strokeDashoffset: "264" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "18%, 58%": { transform: "translateX(-9px)" },
          "38%, 78%": { transform: "translateX(9px)" },
        },
        mnPop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        mnSheen: {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(320%) skewX(-18deg)" },
        },
        mnFloat: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(0, -18px)" },
        },
        mnFloat2: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(0, 22px)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.55s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "progress-fill": "progressFill 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shake: "shake 0.5s ease-in-out forwards",
        "mn-pop": "mnPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "mn-sheen": "mnSheen 4.5s ease-in-out infinite",
        "mn-float": "mnFloat 13s ease-in-out infinite",
        "mn-float2": "mnFloat2 16s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
