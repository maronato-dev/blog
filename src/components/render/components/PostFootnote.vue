<template>
  <sup class="footnote-ref">
    <a :id="`fnref${assigned}`" class="ref-link" :href="`#fn${assigned}`">[{{ assigned }}]</a>
  </sup>
  <aside :id="`fa${assigned}`" class="footnote-aside">
    <slot />
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { usePostFootnotes } from "../../../hooks/postHelpers"

export default defineComponent((_props, { slots }) => {
  const { assigned } = usePostFootnotes(slots.default)
  return { assigned }
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
    @apply right-0 block transform translate-x-full pl-5 -mt-4;
    width: calc(100% / 3);
  }
  @screen lg {
    width: calc(100% / 2);
  }
  @screen xl {
    width: calc(100% / 2);
  }
}
.ref-link {
  @apply pt-24 -mt-24;
}
</style>
