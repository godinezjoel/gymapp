import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  // Ohne diese Option setzt Tailwind hover: als reine :hover-Regel um. Auf dem
  // Handy bleibt ein solcher Zustand nach dem Antippen kleben, bis woanders
  // getippt wird – die Karte sähe dann dauerhaft angefasst aus.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      keyframes: {
        "flame-flicker": {
          "0%, 100%": { transform: "scale(1) rotate(-3deg)" },
          "25%": { transform: "scale(1.08) rotate(3deg)" },
          "50%": { transform: "scale(0.94) rotate(-2deg)" },
          "75%": { transform: "scale(1.05) rotate(2deg)" },
        },
      },
      animation: {
        "flame-flicker": "flame-flicker 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
