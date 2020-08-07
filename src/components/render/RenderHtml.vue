<script lang="ts">
import { defineComponent, compile, computed } from "vue"

import { usePostFootnotes, usePostReferences } from "../../hooks/postHelpers"
import { useScrollToAnchorOnLoad } from "../../hooks/route"
import components from "./components"
import { useReframe } from "./hooks/reframe"
import { usePrism } from "./hooks/prism"
import { useMathjax } from "./hooks/mathjax"
import { useGlightbox } from "./hooks/glightbox"
import { useHeadingAnchors } from "./hooks/anchors"

export default defineComponent({
  components,
  props: {
    html: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    useReframe()
    usePrism()
    useMathjax()
    useGlightbox()
    useHeadingAnchors()
    useScrollToAnchorOnLoad()

    // Reset footnotes and references on created
    const { reset: resetFootnotes } = usePostFootnotes()
    const { reset: resetReferences } = usePostReferences()
    resetFootnotes()
    resetReferences()

    const html = computed(() => props.html.split("<code").join("<code v-pre"))
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
