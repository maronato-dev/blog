<template>
  <hr
    class="my-4 border-t border-gray-400 dark:border-gray-800 border-solid h-px"
  />
  <div class="font-light text-base tracking-wider mb-1 xl:-mb-4 opacity-75">
    {{ title }}
  </div>
  <div class="opacity-75 ghost-content-container" :class="{ aside }">
    <ul>
      <slot />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useAside } from "../../../hooks/postHelpers"

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    const aside = useAside()
    return { aside }
  },
})
</script>
