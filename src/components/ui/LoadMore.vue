<template>
  <div ref="elRef" />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue"
import { useIntersectionObserver } from "../../hooks/intersectionObserver"

export default defineComponent({
  emits: {
    "load-more": () => true,
  },
  setup(_, { emit }) {
    const elRef = ref<HTMLElement | null>(null)
    const { isIntersecting } = useIntersectionObserver(elRef, {
      rootMargin: "300px",
    })

    watch(isIntersecting, intersecting => {
      if (intersecting) {
        emit("load-more")
      }
    })
    return { elRef }
  },
})
</script>
