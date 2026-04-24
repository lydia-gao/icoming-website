import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm, eco-friendly palette — earth tones with a sage accent
        sand: {
          50: "#faf7f2",
          100: "#f2ece0",
          200: "#e6dcc6",
          300: "#d4c3a1",
          400: "#bfa378",
          500: "#a8875a",
        },
        ink: {
          50: "#f6f5f2",
          100: "#e8e5dd",
          400: "#6b6459",
          600: "#403a32",
          800: "#25221d",
          900: "#171512",
        },
        moss: {
          50: "#f2f5ee",
          100: "#e0e8d4",
          300: "#a9c286",
          500: "#6a8f5a",
          600: "#547046",
          700: "#3d5534",
          800: "#2b3c24",
        },
        clay: {
          400: "#d88a6a",
          500: "#c8704a",
          600: "#a8593a",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Inter",
          "sans-serif",
        ],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
