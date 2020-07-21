<script lang="ts">
import {
  defineComponent,
  compile,
  onMounted,
  getCurrentInstance,
  computed,
} from "vue"
import components from "./components"
import reframe from "reframe.js"
import Prism from "prismjs"

// Configure prism
import "prismjs/plugins/autoloader/prism-autoloader.min.js"
import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js"
import "prismjs/plugins/toolbar/prism-toolbar.min.js"
import "prismjs/plugins/show-language/prism-show-language.min.js"

import "../../assets/css/prismjs/plugins/toolbar.css"
import "../../assets/css/prismjs/themes/material-dark.css"

Prism.plugins.autoloader.languages_path =
  "https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0/components/"
Prism.languages.vue = Prism.languages.html

const reframeEmbeds = (el: HTMLElement) => {
  const selectors = [
    "iframe[src*='player.vimeo.com']",
    "iframe[src*='youtube.com']",
    "iframe[src*='youtube-nocookie.com']",
    "iframe[src*='kickstarter.com'][src*='video.html']",
    "object",
    "embed",
  ]
  for (const selector of selectors) {
    reframe(el.querySelectorAll(selector))
  }
}

export default defineComponent({
  components,
  props: {
    html: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const html = computed(() => props.html.split("<code").join("<code v-pre"))
    onMounted(() => {
      const vm = getCurrentInstance()
      if (!vm) throw "Component instance not available!"

      let el = vm.vnode.el as HTMLElement
      if (el) {
        el = el.parentNode as HTMLElement
      }
      reframeEmbeds(el)
    })

    onMounted(() => Prism.highlightAll())

    // Load mathjax
    onMounted(() => {
      window.MathJax.config.tex.inlineMath = [
        ["$", "$"],
        ["\\(", "\\)"],
      ]
      window.MathJax.startup.getComponents()
      window.MathJax.startup.document.state(0)
      window.MathJax.texReset()
      window.MathJax.typeset()
    })

    return compile(html.value)
  },
})
</script>
