/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Clash Display", "Space Grotesk", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0d0d0d",
          soft: "#151515",
          muted: "#404040",
        },
        bone: {
          DEFAULT: "#f2e9d8",
          soft: "#e7ddc9",
        },
        sand: "#bfa688",
        accent: {
          // softened terracotta family for a calmer, more soothing feel
          DEFAULT: "#c1685c",
          glow: "#d78b7e",
          warm: "#bfa688",
          // kept as a key so existing `accent-cyan` classes resolve; points to sand
          cyan: "#bfa688",
        },
      },
      boxShadow: {
        glow: "0 0 60px -18px rgba(193, 104, 92, 0.45)",
        "glow-warm": "0 0 60px -18px rgba(191, 166, 136, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.7" },
          "94%": { opacity: "1" },
          "97%": { opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        flicker: "flicker 6s infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
