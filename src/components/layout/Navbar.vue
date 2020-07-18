<template>
  <nav
    v-click-outside="clickOutside"
    class="bg-white py-3 px-8 dark:bg-gray-900 dark:text-gray-100 shadow fixed w-full z-10"
    :class="{ hide }"
  >
    <div class="container mx-auto flex items-center justify-between flex-wrap">
      <div class="flex items-center flex-shrink-0 mr-6">
        <div class="flex items-center py-2 pr-5 lg:hidden" @click="toggle">
          <svg class="fill-current h-5 w-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </div>
        <router-link to="/">
          <img v-if="settings.logo" class="w-20 lg:w-32" :src="settings.logo" :alt="settings.title" />
          <span v-else class="font-semibold text-xl tracking-tight">{{ settings.title }}</span>
        </router-link>
      </div>
      <div class="lg:order-last lg:ml-4">
        <a>
          <svg
            viewBox="0 0 20 20"
            class="w-8 h-8 cursor-pointer fill-current opacity-75 hover:opacity-100 transition-all duration-200"
            @click="toggleTheme"
            @mousedown.prevent
          >
            <path :d="svgPath" />
          </svg>
        </a>
      </div>
      <div
        class="w-full flex-grow lg:flex lg:items-center lg:w-auto nav-menu uppercase"
        :class="{ collapse }"
      >
        <div class="text-sm lg:flex-grow nav">
          <router-link
            v-for="nav in settings.navigation"
            :key="nav.label"
            :to="nav.url"
            class="block mt-2 lg:inline-block lg:mt-0 lg:mr-4 text-lg lg:text-base text-current animated-underline"
            active-class="active"
          >{{ nav.label }}</router-link>
        </div>
        <div class="lg:flex lg:items-center lg:flex-shrink-0">
          <a
            v-for="nav in settings.secondary_navigation"
            :key="nav.label"
            :href="nav.url"
            class="block mt-2 lg:inline-block lg:mt-0 lg:mr-4 text-lg lg:text-base animated-underline"
          >{{ nav.label }}</a>
        </div>
        <lang-selector />
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useWindowScroll, useThrottle } from "@vueuse/core"
import { useSettings } from "../../hooks/ghost"
import { useTheme } from "../../hooks/theme"
import LangSelector from "./LangSelector/LangSelector.vue"

const sunSVG =
  "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
const moonSVG =
  "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"

export default defineComponent({
  components: { LangSelector },
  setup() {
    const { settings } = useSettings()
    const { isDark, toggleTheme } = useTheme()
    const svgPath = computed(() => (isDark.value ? sunSVG : moonSVG))

    const collapse = ref(true)
    const router = useRouter()
    router.beforeEach((_to, _from, next) => {
      collapse.value = true
      return next()
    })
    const clickOutside = () => (collapse.value = true)
    const toggle = () => (collapse.value = !collapse.value)

    const { y } = useWindowScroll()
    const throttleY = useThrottle(y, 100)
    const lastScroll = ref(y.value)
    const hide = ref(false)
    watch(throttleY, () => {
      const threshold = 40
      const difference = throttleY.value - lastScroll.value
      const goingDown = difference > threshold / 2
      const goingUp = -difference > threshold || y.value < threshold
      lastScroll.value = y.value

      if (goingDown && !hide.value) {
        requestAnimationFrame(() => (hide.value = true))
      } else if (goingUp && hide.value) {
        requestAnimationFrame(() => (hide.value = false))
      }
    })

    return {
      settings,
      toggle,
      collapse,
      toggleTheme,
      svgPath,
      clickOutside,
      hide,
    }
  },
})
</script>

<style lang="postcss" scoped>
nav {
  @apply transition-transform transform translate-y-0 ease-in-out duration-150;
  &.hide {
    @apply -translate-y-full;
  }
}
.nav-menu {
  @apply duration-500 overflow-hidden;
  transition-property: max-height;
  max-height: 100vh;
  &.collapse {
    max-height: 0px;
  }
  @screen lg {
    @apply overflow-visible;
    &.collapse {
      max-height: unset;
    }
  }
}
</style>