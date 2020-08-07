<template>
  <div
    class="prose md:prose-lg xl:prose-xl ghost-content ghost-content-container"
    :class="{ aside, 'prose-dark': isDark }"
  >
    <div class="flex flex-col items-center">
      <render-html :key="html" :html="html" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import RenderHtml from "../render/RenderHtml.vue"
import { useTheme } from "../../hooks/theme"
import { useAside } from "../../hooks/postHelpers/index"

export default defineComponent({
  components: { RenderHtml },
  props: {
    html: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { isDark } = useTheme()

    const aside = useAside()

    return { isDark, aside }
  },
})
</script>
