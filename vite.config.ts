import type { UserConfig } from "vite"
import { supportedExts } from "vite/dist/node/resolver"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import webWorkerLoader from "rollup-plugin-web-worker-loader"

const config: UserConfig = {
  serviceWorker: false,
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
  rollupInputOptions: {
    plugins: [
      webWorkerLoader({
        targetPlatform: "browser",
        pattern: /(.+)\?worker$/,
        extensions: supportedExts,
      }),
    ],
  },
}
export default config
