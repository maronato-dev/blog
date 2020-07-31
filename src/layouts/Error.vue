<template>
  <div class="wrapper">
    <div class="flex-grow">
      <nav-bar />
      <section
        class="my-20 px-5 mx-auto container content-center text-center flex flex-col flex-wrap"
      >
        <page404 v-if="code === 404" />
        <page500 v-else-if="code === 500" />
        <template v-else>
          <div>Error {{ code }}</div>
          <div>{{ message }}</div>
        </template>
        <div class="flex-row">
          <router-link
            class="animated-underline text-xl font-bold group"
            to="/"
          >
            <icon-arrow-left
              class="w-4 h-4 animate-none group-hover:animate-bounce-left rotate-90 inline-block"
            />
            {{ goBackMessage }}
          </router-link>
        </div>
      </section>
    </div>
    <blog-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { useI18n } from "vue-i18n"
import BlogFooter from "../components/layout/BlogFooter.vue"
import NavBar from "../components/layout/Navbar.vue"
import Page404 from "../components/layout/404.vue"
import Page500 from "../components/layout/500.vue"
import { useFormattedTitle } from "../hooks/ghost/content/title"
import { useLayout } from "../hooks/layout"
import IconArrowLeft from "../components/ui/Icons/IconArrowLeft.vue"

export default defineComponent({
  name: "ErrorLayout",
  components: {
    NavBar,
    BlogFooter,
    Page404,
    Page500,
    IconArrowLeft,
  },
  setup() {
    const { error } = useLayout()
    const i18n = useI18n()

    const code = computed(() => (error.value ? error.value.code : 500))
    const message = computed(() =>
      i18n.t(error.value ? error.value.message : "layout.error.500-message")
    )
    const goBackMessage = computed(() => {
      return i18n.t("layout.error.go-back")
    })
    useFormattedTitle(message)
    return { code, message, goBackMessage }
  },
})
</script>
<style lang="postcss" scoped>
.wrapper {
  @apply flex flex-col;
  height: 100vh;
}
</style>
