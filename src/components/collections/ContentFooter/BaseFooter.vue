<template>
  <hr class="opacity-50 my-4" />
  <div class="font-light text-base tracking-wider capitalize mb-1 xl:-mb-4 opacity-75">{{ title }}</div>
  <div class="content-list opacity-75">
    <ul>
      <slot />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
  },
})
</script>
<style lang="postcss" scoped>
.content-list {
  @screen xl {
    @apply mx-auto;
    max-width: calc(100% * 2 / 3);
  }
}
</style>
