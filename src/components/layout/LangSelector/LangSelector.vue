<template>
  <component :is="langComponent" />
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { useWindowSize } from "@vueuse/core"
import LangAccordion from "./LangAccordion.vue"
import LangDropdown from "./LangDropdown.vue"

export default defineComponent({
  components: { LangAccordion, LangDropdown },
  setup() {
    const { width } = useWindowSize()
    const isLarge = computed(() => width.value >= 1024)
    const langComponent = computed(() =>
      isLarge.value ? "LangDropdown" : "LangAccordion"
    )
    return { langComponent }
  },
})
</script>
