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
        // Paleta alinhada à identidade escura da MetamorphosAI (mesma família de
        // neutros e o mesmo laranja-coral). `ink` e `accent` são invertidos em
        // relação à versão anterior (clara): número baixo = mais escuro, número
        // alto = mais claro — porque agora são lidos sobre um fundo escuro.
        // `brand` e `danger` mantêm a direção original (número alto = mais
        // escuro/saturado) porque são usados como fundo sólido de botão com
        // texto branco em cima.
        brand: {
          50: "#FDF3EF",
          100: "#FBE4DA",
          200: "#F5C7B2",
          300: "#F2A880",
          400: "#F29A72", // laranja MetamorphosAI (--orange)
          500: "#E8835A",
          600: "#D97951", // laranja escuro MetamorphosAI (--orange-dark)
          700: "#B3603F",
          800: "#8F4B31",
          900: "#6E3924",
          950: "#451F13",
        },
        ink: {
          50: "#101214",
          100: "#16191C",
          200: "#1E2226",
          300: "#292E33",
          400: "#454B52",
          500: "#6D737B", // = --text-muted da MetamorphosAI
          600: "#828A92",
          700: "#989FA8", // = --text-soft da MetamorphosAI
          800: "#C1C6CB",
          900: "#F4F4F5", // = --text da MetamorphosAI
          950: "#FFFFFF",
        },
        accent: {
          50: "#1C160C",
          100: "#241C0F",
          200: "#3A2D18",
          300: "#56421F",
          400: "#7A5D2B",
          500: "#A37A3C",
          600: "#C99752",
          700: "#D9AF68", // amarelo MetamorphosAI (--yellow)
          800: "#E8C78F",
          900: "#F3DDB5",
          950: "#FAEDD6",
        },
        danger: {
          50: "#170C0C",
          100: "#241212",
          400: "#7D3A3A",
          500: "#A54A4A",
          600: "#DC7777", // vermelho MetamorphosAI (--red)
          700: "#E8A3A3",
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
