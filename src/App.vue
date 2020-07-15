<template>
  <component :is="layoutComponent" :key="layoutComponent">
    <router-view v-slot="{ Component }">
      <transition name="fade" appear mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from "vue"
import { useLocaleSync } from "./hooks/locale"
import { useTheme } from "./hooks/theme"
import { useLayoutComponent, useLayout, components } from "./hooks/layout"
import { useSettings, useSocialMetaTags } from "./hooks/ghost"

export default defineComponent({
  name: "App",
  components: { ...components },
  setup() {
    useLocaleSync()
    useTheme()
    useSocialMetaTags()
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
    watch(layoutComponent, () =>
      console.log("changing layout to", layoutComponent.value)
    )
    return { layoutComponent, settings }
  },
})
</script>
