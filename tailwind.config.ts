import type { Config } from "tailwindcss";

export default {
  // Include all app files and public static HTML/JS so Tailwind can
  // discover all utility class usage in Remix routes and public assets.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.{html,js}",
  ],
  // Use the OS preference by default (the codebase already uses prefers-color-scheme in CSS)
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
