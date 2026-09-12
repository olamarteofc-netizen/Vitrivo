import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        brand: {
          50: "#F1F8F5",
          100: "#DCEEE5",
          200: "#B9DDCC",
          300: "#8FC7AE",
          400: "#5FA98C",
          500: "#3D8A70",
          600: "#2C6E59",
          700: "#245A49",
          800: "#1E483C",
          900: "#193A31",
          950: "#0E211C",
        },
        ink: {
          50: "#F8F7F5",
          100: "#EFEDE9",
          200: "#DDD9D2",
          300: "#C2BCB1",
          400: "#9C9485",
          500: "#786F60",
          600: "#5C544A",
          700: "#463F38",
          800: "#332E29",
          900: "#211E1A",
          950: "#14120F",
        },
        accent: {
          50: "#FDF6EC",
          100: "#FAEACB",
          200: "#F3D293",
          300: "#EBB85D",
          400: "#DFA23A",
          500: "#C4832A",
          600: "#A16621",
          700: "#7D4F1B",
          800: "#5E3C16",
          900: "#432B10",
        },
        danger: {
          50: "#FDF0EF",
          100: "#FADBD8",
          400: "#E1685B",
          500: "#C8493B",
          600: "#A6392D",
          700: "#832C22",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(33 30 26 / 0.04), 0 1px 8px -2px rgb(33 30 26 / 0.06)",
        elevated: "0 8px 24px -8px rgb(33 30 26 / 0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
