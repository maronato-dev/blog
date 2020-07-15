<template>
  <div class="flex justify-center items-center pt-20">
    <loading-spinner />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import LoadingSpinner from "./LoadingSpinner.vue"

export default defineComponent({
  components: { LoadingSpinner },
})
</script>
