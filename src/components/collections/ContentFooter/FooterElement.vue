<template>
  <li :class="{ active }" class="opacity-75 text-sm mb-2 footer-component">
    {{ index }}.
    <component :is="contentSlot" />
    <a
      :id="`${hash}${index}`"
      :href="`#${hash}ref${index}`"
      class="ml-2 underline opacity-75 hover:opacity-100 transition-opacity duration-200"
    >↩︎</a>
  </li>
</template>

<script lang="ts">
import { defineComponent, Slot, PropType, computed } from "vue"
import { useRoute } from "vue-router"

export default defineComponent({
  props: {
    contentSlot: {
      type: Function as PropType<Slot>,
      required: true,
    },
    index: {
      type: [Number, String],
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute()
    const active = computed(() => route.hash === `#${props.hash}${props.index}`)
    return { active }
  },
})
</script>
<style lang="postcss" scoped>
.active {
  @apply opacity-100 font-semibold;
}
</style>
<style lang="postcss">
.footer-component {
  & a {
    @apply text-current underline opacity-100 transition-opacity duration-200;
    &:hover {
      @apply opacity-75;
    }
  }
}
</style>
