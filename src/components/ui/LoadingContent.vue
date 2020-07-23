<template>
  <div class="flex justify-center items-center pt-20">
    <loading-spinner v-show="show" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import LoadingSpinner from "./LoadingSpinner.vue"

export default defineComponent({
  components: { LoadingSpinner },
  props: {
    delay: {
      type: Number,
      default: 200,
    },
  },
  setup(props) {
    const show = ref(false)
    useTimeoutFn(() => {
      show.value = true
    }, props.delay)
    return { show }
  },
})
</script>
