/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
      },
      colors: {
        "primary-red": "#d90429ff",
        "primary-grey": "#19323C",
        "primary-red-dark": "#b00322",
        "primary-grey-dark": "#142a34",
      },
    },
  },
  plugins: [],
};
