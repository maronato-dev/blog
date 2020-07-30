<script lang="ts">
import {
  defineComponent,
  compile,
  onMounted,
  getCurrentInstance,
  computed,
  onUnmounted,
} from "vue"
import reframe from "reframe.js"
import Prism from "prismjs"
import GLightbox from "glightbox"

// Configure prism
import "prismjs/plugins/autoloader/prism-autoloader.min.js"
import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js"
import "prismjs/plugins/toolbar/prism-toolbar.min.js"
import "prismjs/plugins/show-language/prism-show-language.min.js"

import "../../assets/css/prismjs/plugins/toolbar.css"
import "../../assets/css/prismjs/themes/material-dark.css"
import { useRoute } from "vue-router"
import { useMeta } from "../../hooks/meta"
import components from "./components"

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

const anchorHeadings = (el: HTMLElement) => {
  el.querySelectorAll("h1,h2,h3,h4").forEach(heading => {
    const anchor = document.createElement("a")
    anchor.setAttribute("class", "heading-anchor")
    anchor.setAttribute("href", `#${heading.id}`)
    anchor.textContent = "#"
    heading.appendChild(anchor)
  })
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

    // Reframe videos and embeddings
    onMounted(() => {
      const vm = getCurrentInstance()
      if (!vm) throw "Component instance not available!"

      let el = vm.vnode.el as HTMLElement
      if (el) {
        el = el.parentNode as HTMLElement
      }
      reframeEmbeds(el)
    })

    // Highlight code
    onMounted(() => Prism.highlightAll())

    // Load mathjax
    onMounted(() => {
      window.MathJax.config.tex.inlineMath = [
        ["$", "$"],
        ["\\(", "\\)"],
      ]
      window.MathJax.config.tex.tags = "ams"
      window.MathJax.startup.getComponents()
      window.MathJax.startup.document.state(0)
      window.MathJax.texReset()
      window.MathJax.typeset()
    })

    // Glightbox
    const { link } = useMeta()
    const linkValue = link.value ? link.value : []
    linkValue.push({
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css",
    })
    link.value = linkValue
    const glightbox = new GLightbox({
      selector: ".kg-image,.kg-gallery-image img",
    })
    onMounted(() => {
      glightbox.reload()
    })
    onUnmounted(() => {
      glightbox.destroy()
    })

    // Navigate to anchor on load
    onMounted(() => {
      const route = useRoute()
      if (route.hash) {
        const el = document.querySelector(route.hash)
        if (el) {
          el.scrollIntoView()
        }
      }
    })

    // Add anchors to headings
    onMounted(() => {
      const vm = getCurrentInstance()
      if (!vm) throw "Component instance not available!"

      let el = vm.vnode.el as HTMLElement
      if (el) {
        el = el.parentNode as HTMLElement
      }
      anchorHeadings(el)
    })

    return compile(html.value)
  },
})
</script>
<style lang="postcss">
html.glightbox-open {
  height: unset;
  overflow: unset;
}
body.glightbox-open {
  height: unset;
  overflow: unset;
}
</style>
