<template>
  <component :is="layoutComponent" :key="layoutComponent">
    <router-view />
  </component>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { useLocaleSync } from "./hooks/locale"
import { useTheme } from "./hooks/theme"
import { useLayoutComponent, useLayout, components } from "./hooks/layout"
import { useSettings } from "./hooks/ghost/content/settings"
import { useSEOTags, useFavicon } from "./hooks/seo"
import { useDatabaseSync } from "./hooks/ghost/content/worker"
import { useAnalytics } from "./hooks/analytics"

export default defineComponent({
  name: "App",
  components: { ...components },
  setup() {
    useLocaleSync()
    useTheme()
    useSEOTags()
    useFavicon()

    const sync = useDatabaseSync()
    sync()

    const { layout } = useLayout()
    const { fetch, settings } = useSettings()
    watch(
      settings,
      () => {
        if (!settings.value) {
          layout.value = "loading"
        } else if (layout.value === "loading" && !!settings.value) {
          layout.value = "default"
        }
      },
      { immediate: true }
    )

    // Make sure settings are updated on app load
    onMounted(fetch)
    const layoutComponent = useLayoutComponent()

    // Analytics
    const { trackPageview } = useAnalytics()
    const router = useRouter()
    router.afterEach((_to, _from) => {
      trackPageview()
    })

    return { layoutComponent, settings }
  },
})
</script>
