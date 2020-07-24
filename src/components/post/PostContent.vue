<template>
  <div class="ghost-content" :class="{ aside }">
    <div class="flex flex-col items-center">
      <render-html :key="html" :html="html" />
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
    aside: Boolean,
  },
})
</script>
