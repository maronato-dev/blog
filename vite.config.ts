import type { SharedConfig } from "vite"

const config: SharedConfig = {
  alias: {
    vue: "vue/dist/vue.esm-bundler.js",
  },
  optimizeDeps: {
    include: [
      "prismjs/plugins/show-language/prism-show-language.min.js",
      "prismjs/plugins/autoloader/prism-autoloader.min.js",
      "prismjs/plugins/toolbar/prism-toolbar.min.js",
      "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js",
    ],
  },
}
export default config
