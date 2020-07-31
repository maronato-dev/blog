<template>
  <div
    class="prose md:prose-lg xl:prose-xl ghost-content"
    :class="{ aside, 'prose-dark': isDark }"
  >
    <div class="flex flex-col items-center">
      <render-html :html="html" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import RenderHtml from "../render/RenderHtml.vue"
import { useTheme } from "../../hooks/theme"

export default defineComponent({
  components: { RenderHtml },
  props: {
    html: {
      type: String,
      required: true,
    },
    aside: Boolean,
  },
  setup() {
    const { isDark } = useTheme()
    return { isDark }
  },
})
</script>
