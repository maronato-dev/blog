<template>
  <div class="flex justify-center items-center min-h-screen">
    <loading-spinner />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import LoadingSpinner from "../components/ui/LoadingSpinner.vue"

export default defineComponent({
  components: { LoadingSpinner },
})
</script>
