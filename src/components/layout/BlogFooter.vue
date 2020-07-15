<template>
  <footer
    class="relative bg-white py-6 px-8 dark:bg-gray-900 dark:text-gray-100 w-full z-10 border-t border-gray-300 dark:border-gray-800"
  >
    <div
      class="container mx-auto flex items-center justify-around md:justify-between flex-wrap flex-col md:flex-row content-around"
    >
      <div class>Footer left</div>
      <div>
        <span class="label ml-1">&copy; {{ year }}.</span>
        <span class="label ml-1">Made by</span>
        <span class="value ml-1">Maronato</span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue"
export default defineComponent(() => {
  const date = new Date()
  const year = date.getFullYear()

  return { year }
})
</script>
<style lang="postcss" scoped>
.label {
  @apply text-gray-600;
  @nest .dark-mode & {
    @apply text-gray-600;
  }
}
</style>