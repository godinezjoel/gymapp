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
    },
  },
  plugins: [],
};

export default config;
