<template>
  <div class="ghost-content">
    <div class="flex flex-col items-center">
      <render-html :html="html" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import RenderHtml from "../render/RenderHtml.vue"

export default defineComponent({
  components: { RenderHtml },
  props: {
    html: {
      type: String,
      required: true,
    },
  },
})
</script>
