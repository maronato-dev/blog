/* eslint-disable @typescript-eslint/no-var-requires */
/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */

module.exports = {
  theme: {
    darkSelector: ".dark-mode",
    typography: theme => ({
      default: {
        css: {
          table: {
            width: "auto",
          },
          "code::before": {
            // eslint-disable-next-line quotes
            content: '""',
          },
          "code::after": {
            // eslint-disable-next-line quotes
            content: '""',
          },
        },
      },
      dark: {
        css: {
          color: theme("colors.gray.400"),
          // eslint-disable-next-line quotes
          '[class~="lead"]': {
            color: theme("colors.gray.400"),
          },
          a: {
            color: theme("colors.gray.100"),
          },
          strong: {
            color: theme("colors.gray.100"),
          },
          "ol > li::before": {
            color: theme("colors.gray.600"),
          },
          "ul > li::before": {
            backgroundColor: theme("colors.gray.600"),
          },
          hr: {
            borderColor: theme("colors.gray.700"),
          },
          blockquote: {
            color: theme("colors.gray.100"),
            borderLeftColor: theme("colors.gray.700"),
          },
          h1: {
            color: theme("colors.gray.100"),
          },
          h2: {
            color: theme("colors.gray.100"),
          },
          h3: {
            color: theme("colors.gray.100"),
          },
          h4: {
            color: theme("colors.gray.100"),
          },
          "figure figcaption": {
            color: theme("colors.gray.600"),
          },
          code: {
            color: theme("colors.gray.100"),
          },
          pre: {
            color: theme("colors.gray.400"),
            // backgroundColor: theme("colors.gray.300"),
          },
          thead: {
            color: theme("colors.gray.100"),
            borderBottomColor: theme("colors.gray.500"),
          },
          "tbody tr": {
            borderBottomColor: theme("colors.gray.500"),
          },
        },
      },
    }),
    extend: {
      opacity: {
        85: ".85",
        90: ".9",
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
          100: "#f9f9fb",
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
      keyframes: {
        "bounce-left": {
          "50%": {
            transform: "translateX(-25%)",
            animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
          },
          "0%, 100%": {
            transform: "translateX(0)",
            animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
          },
        },
      },
      animation: {
        "bounce-left": "bounce-left 1s infinite",
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
      "group-focus",
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
    typography: ["responsive", "dark"],
    animation: ["responsive", "hover", "focus", "group-hover"],
    display: ["responsive", "last"],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-dark-mode")(),
  ],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === "production",
    content: ["./src/**/*.vue", "./src/**/*.ts", "./index.html"],
    options: {
      whitelist: ["dark-mode"],
    },
  },
}
