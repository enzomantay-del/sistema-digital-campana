import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3f0e8",
        card: "#fffdf8",
        ink: "#1b2421",
        muted: "#5e675f",
        line: "#e4ddd0",
        accent: "#0e6b5c",
        "accent-dark": "#0b564a",
        warn: "#8a4b12",
      },
      fontFamily: {
        sans: ["var(--font-source)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "64rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
