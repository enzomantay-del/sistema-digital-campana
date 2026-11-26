import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f9fc",
        card: "#ffffff",
        ink: "#12275c",
        muted: "#5a6d86",
        line: "#d4e3f0",
        accent: "#1786cc",
        "accent-dark": "#0c6aaa",
        menta: "#45c0a8",
        link: "#1478c0",
        warn: "#9a3412",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "76rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
