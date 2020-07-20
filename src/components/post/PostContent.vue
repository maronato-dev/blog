<template>
  <div class="ghost-content" :class="{ aside }">
    <div class="flex flex-col items-center">
      <render-html :html="html" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import RenderHtml from "../render/RenderHtml.vue"
import { usePostFootnotes } from "../../hooks/postHelpers"

export default defineComponent({
  components: { RenderHtml },
  props: {
    html: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { count: footnoteCount } = usePostFootnotes()
    const aside = computed(() => footnoteCount.value > 0)
    return { aside }
  },
})
</script>
