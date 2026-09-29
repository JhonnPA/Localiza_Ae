// cor que muda com o tema: o valor vem de uma variável CSS definida no index.css
const themeColor = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        page: themeColor("page"),
        surface: {
          DEFAULT: themeColor("surface"),
          muted: themeColor("surface-muted"),
        },
        content: themeColor("content"),
        muted: themeColor("muted"),
        subtle: themeColor("subtle"),
        line: themeColor("line"),
        primary: themeColor("primary"),
        link: themeColor("link"),
        brand: {
          yellow: "#FFD60A",
          dark: "#0F172A",
        },
      },
      borderColor: {
        DEFAULT: themeColor("line"),
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
