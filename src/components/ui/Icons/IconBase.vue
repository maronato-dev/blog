<template>
  <svg class="fill-current" :viewBox="viewBox">
    <slot />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent({
  props: {
    viewBox: {
      type: String,
      default: "0 0 20 20",
    },
  },
})
</script>
