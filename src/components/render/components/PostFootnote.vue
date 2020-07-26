<template>
  <sup class="footnote-ref" :class="{ active }">
    <a :id="`fnref${assigned}`" class="ref-link" :href="`#fn${assigned}`">[{{ assigned }}]</a>
  </sup>
  <aside :id="`fa${assigned}`" class="footnote-aside">
    <slot />
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { usePostFootnotes } from "../../../hooks/postHelpers"
import { useRoute } from "vue-router"

export default defineComponent((_props, { slots }) => {
  const { assigned } = usePostFootnotes(slots.default)
  const route = useRoute()
  const active = computed(() => route.hash === `#fnref${assigned}`)
  return { assigned, active }
})
</script>
<style lang="postcss" scoped>
.footnote-aside {
  @apply text-xs tracking-wide font-medium opacity-50 hidden absolute leading-normal;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  & strong,
  & b {
    @apply font-bold tracking-wider opacity-100;
  }

  & a {
    @apply text-current underline opacity-100;
  }

  @screen md {
    @apply right-0 block transform translate-x-full pl-5 -mt-6;
    width: calc(100% / 3);
  }
  @screen lg {
    width: calc(100% / 2);
  }
  @screen xl {
    width: calc(100% / 2);
  }
}
.footnote-ref.active {
  @apply bg-gray-400 bg-opacity-75;
  @nest .dark-mode & {
    @apply bg-gray-700;
  }
}
</style>
