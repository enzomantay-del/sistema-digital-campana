import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f8fc",
        card: "#ffffff",
        ink: "#10243e",
        muted: "#5c6d82",
        line: "#d5e2f0",
        accent: "#149a8e",
        "accent-dark": "#0f7d74",
        link: "#1d4ed8",
        warn: "#9a3412",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "76rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
