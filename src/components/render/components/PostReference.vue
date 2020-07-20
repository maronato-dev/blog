<template>
  <sup class="reference-ref">
    <a :id="`rfref${assigned}`" class="ref-link" :href="`#rf${assigned}`">{{ assigned }}</a>
  </sup>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { usePostReferences } from "../../../hooks/postHelpers"

export default defineComponent((_props, { slots }) => {
  const { assigned } = usePostReferences(slots.default)
  return { assigned }
})
</script>
<style lang="postcss" scoped>
.ref-link {
  @apply pt-24 -mt-24;
}
</style>
