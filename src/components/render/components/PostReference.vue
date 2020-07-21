<template>
  <sup class="reference-ref" :class="{ active }">
    <a :id="`rfref${assigned}`" class="ref-link" :href="`#rf${assigned}`">{{ assigned }}</a>
  </sup>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { usePostReferences } from "../../../hooks/postHelpers"
import { useRoute } from "vue-router"

export default defineComponent((_props, { slots }) => {
  const { assigned } = usePostReferences(slots.default)
  const route = useRoute()
  const active = computed(() => route.hash === `#rfref${assigned}`)
  return { assigned, active }
})
</script>
<style lang="postcss" scoped>
.ref-link {
  @apply pt-24 -mt-24;
}
.reference-ref.active {
  @apply bg-gray-400 bg-opacity-75 px-1;
  @nest .dark-mode & {
    @apply bg-gray-700;
  }
}
</style>
