import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:       "#0a0a0a",
        bgsoft:   "#111111",
        bgcard:   "#161616",
        bgcode:   "#0d0d0d",
        fg:       "#e6e6e6",
        fgmute:   "#9a9a9a",
        fgfaint:  "#6a6a6a",
        line:     "#262626",
        linesoft: "#1c1c1c",
        accent:   "#ff6b00",
        accent2:  "#ff8c3a",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      serif: ["Georgia", "GT Sectra", "Playfair Display", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
