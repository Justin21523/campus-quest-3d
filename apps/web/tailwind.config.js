/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          night: "#0f172a",
          panel: "rgba(15, 23, 42, 0.82)",
          accent: "#38bdf8",
          quest: "#facc15",
          danger: "#fb7185"
        }
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "pulse-soft": "pulseSoft 1.8s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
}
