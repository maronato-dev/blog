<template>
  <div class="wrapper">
    <div class="flex-grow">
      <nav-bar />
      <div class="mt-20">
        <slot />
      </div>
    </div>
    <blog-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import NavBar from "../components/layout/Navbar.vue"
import BlogFooter from "../components/layout/BlogFooter.vue"

export default defineComponent({
  name: "DefaultLayout",
  components: {
    NavBar,
    BlogFooter,
  },
})
</script>
<style lang="postcss" scoped>
.wrapper {
  @apply flex flex-col;
  height: 100vh;
}
</style>
