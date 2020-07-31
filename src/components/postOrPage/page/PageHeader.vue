<template>
  <header
    class="flex xl:justify-around flex-row mx-auto mt-32 mb-10 md:mb-20 flex-wrap items-center"
  >
    <div
      class="flex-col flex items-center md:items-start justify-center mx-auto order-1 md:mx-0 md:w-3/4 lg:w-2/3 xl:w-1/2"
    >
      <h1
        class="leading-tight text-5xl md:text-6xl font-medium title my-8 text-center md:text-left"
      >
        {{ page.title }}
      </h1>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"

export default defineComponent({
  props: {
    page: {
      type: Object as PropType<LocalizedPostOrPage>,
      required: true,
    },
  },
})
</script>
