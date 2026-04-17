import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        trust: "var(--color-trust)",
        "trust-soft": "var(--color-trust-soft)",
        line: "var(--color-line)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": "var(--text-display-xl)",
        "display-lg": "var(--text-display-lg)",
        "display-md": "var(--text-display-md)",
        "body-lg": "var(--text-body-lg)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,17,22,0.04), 0 8px 24px -12px rgba(14,17,22,0.12)",
        lift: "0 2px 4px rgba(14,17,22,0.06), 0 24px 48px -20px rgba(14,17,22,0.20)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
