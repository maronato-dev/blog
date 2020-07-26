/* eslint-disable no-undef */
/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */

module.exports = {
  theme: {
    darkSelector: ".dark-mode",
    extend: {
      opacity: {
        "85": ".85",
        "90": ".9",
      },
      colors: {
        primary: {
          100: "#f0f8ff",
          200: "#a9d5f5",
          300: "#64a1d8",
          400: "#3083c8",
          500: "#2268a2",
          600: "#1a4971",
          700: "#13273a",
        },
        gray: {
          100: "#f1f3f5",
          200: "#eaecee",
          300: "#dee2e6",
          400: "#cfd4da",
          500: "#adb5bd",
          600: "#868e96",
          700: "#495057",
          800: "#343a40",
          900: "#191b1f",
          1000: "#090a0b",
        },
      },
    },
  },
  variants: {
    backgroundColor: [
      "dark",
      "dark-hover",
      "dark-group-hover",
      "dark-even",
      "dark-odd",
      "responsive",
      "hover",
      "focus",
      "active",
      "group-hover",
    ],
    borderColor: ["dark", "dark-focus", "dark-focus-within", "hover"],
    textColor: [
      "dark",
      "dark-hover",
      "dark-active",
      "dark-placeholder",
      "hover",
    ],
    translate: ["hover", "group-hover"],
    scale: ["hover", "focus", "active", "group-hover"],
    opacity: [
      "dark",
      "dark-hover",
      "dark-group-hover",
      "responsive",
      "hover",
      "focus",
      "disabled",
      "active",
      "group-hover",
    ],
    boxShadow: [
      "responsive",
      "hover",
      "focus",
      "active",
      "disabled",
      "group-hover",
    ],
    transitionProperty: ["responsive", "hover"],
  },
  plugins: [require("tailwindcss-dark-mode")()],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === "production",
    content: ["./src/**/*.vue", "./src/**/*.ts", "./index.html"],
  },
}
