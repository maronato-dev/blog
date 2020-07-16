<template>
  <div class="wrapper">
    <div class="flex-grow">
      <nav-bar />
      <div class="mt-20">
        <div>Error {{ code }}</div>
        <div>{{ message }}</div>
        <router-link to="/">Go back</router-link>
      </div>
    </div>
    <blog-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import NavBar from "../components/layout/Navbar.vue"
import BlogFooter from "../components/layout/BlogFooter.vue"
import { useI18n } from "vue-i18n"
import { useLayout } from "../hooks/layout"
import { useFormattedTitle } from "../hooks/ghost/content"

export default defineComponent({
  name: "ErrorLayout",
  components: {
    NavBar,
    BlogFooter,
  },
  setup() {
    const { error } = useLayout()
    const i18n = useI18n()

    const code = computed(() => (error.value ? error.value.code : 500))
    const message = computed(() =>
      i18n.t(error.value ? error.value.message : "layout.error.500-message")
    )
    useFormattedTitle(message)
    return { code, message }
  },
})
</script>
<style lang="postcss" scoped>
.wrapper {
  @apply flex flex-col;
  height: 100vh;
}
</style>
