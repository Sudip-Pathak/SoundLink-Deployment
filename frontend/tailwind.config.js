/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#0a0a0a",
        "black-true": "#000",
        "primary-dark": "#18181b",
        accent: "#f472b6",
        "accent-dark": "#a21caf",
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          }
        }
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
      },
      backgroundSize: {
        'gradient-shift': '200% 200%',
      }
    },
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        spotify: {
          "primary": "#1DB954",
          "secondary": "#1ed760",
          "accent": "#1DB954",
          "neutral": "#b3b3b3",
          "base-100": "#121212",
          "base-200": "#181818",
          "base-300": "#282828",
          "info": "#3abff8",
          "success": "#1DB954",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      "dark",
    ],
  },
}