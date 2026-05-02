/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          950: "#070b14",
          900: "#0d1117",
          800: "#111827",
          700: "#1a2235",
          600: "#1e2a3d",
          500: "#243047",
        },
        brand: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease both",
        "spin-slow": "spin 1s linear infinite",
        blink: "blink 2s infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        blink: {
          "0%,100%": { opacity: 1 },
          "50%":      { opacity: 0.3 },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        glow:    "0 0 20px rgba(99,102,241,0.25)",
        "glow-lg":"0 0 40px rgba(99,102,241,0.3)",
        glass:   "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        card:    "0 4px 24px rgba(0,0,0,0.3)",
        "card-hover": "0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.15)",
      },
    },
  },
  plugins: [],
};
