<template>
  <nav
    v-click-outside="clickOutside"
    class="bg-white py-3 px-8 dark:bg-gray-900 dark:text-gray-100 shadow-sm fixed w-full z-10"
    :class="{ hide }"
  >
    <div class="container mx-auto flex items-center justify-between flex-wrap">
      <div class="flex items-center flex-shrink-0 mr-6 lg:order-first">
        <div class="flex items-center py-2 pr-5 lg:hidden" @click="toggle">
          <svg
            class="fill-current h-5 w-5"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </div>
        <router-link to="/">
          <img
            v-if="settings.logo"
            class="w-20 lg:w-32"
            :src="settings.logo"
            :alt="settings.title"
          />
          <span v-else class="font-semibold text-xl tracking-tight">
            {{ settings.title }}
          </span>
        </router-link>
      </div>
      <div class="lg:order-last lg:ml-4 flex align-middle items-center">
        <search-box class="mr-4" />
        <a>
          <icon-toggle-theme
            class="w-6 h-6 cursor-pointer fill-current opacity-75 hover:opacity-100 transition-all duration-200"
            @click="toggleTheme"
            @mousedown.prevent
          />
        </a>
      </div>
      <div
        class="w-full flex-grow lg:flex lg:items-center lg:w-auto nav-menu uppercase lg:order-2"
        :class="{ collapse }"
      >
        <div class="text-sm lg:flex-grow nav">
          <router-link
            v-for="nav in settings.navigation"
            :key="nav.label"
            :to="nav.url"
            class="block mt-2 lg:inline-block lg:mt-0 lg:mr-4 text-lg lg:text-base text-current animated-underline"
            active-class="active"
          >
            {{ nav.label }}
          </router-link>
        </div>
        <div class="lg:flex lg:items-center lg:flex-shrink-0">
          <a
            v-for="nav in settings.secondary_navigation"
            :key="nav.label"
            :href="nav.url"
            class="block mt-2 lg:inline-block lg:mt-0 lg:mr-4 text-lg lg:text-base animated-underline"
          >
            {{ nav.label }}
          </a>
        </div>
      </div>
      <div
        class="w-full lg:flex lg:items-center lg:w-auto nav-menu uppercase lg:order-3"
        :class="{ collapse }"
      >
        <lang-selector />
      </div>
      <div
        class="w-full lg:flex lg:items-center lg:w-auto nav-menu uppercase lg:order-4"
        :class="{ collapse }"
      >
        <div class="tx-sm nav hidden lg:block ml-4">
          <a :href="feedUrl">
            <icon-rss
              class="w-6 h-6 opacity-75 hover:opacity-100 hover:text-orange-500 transition-all duration-300"
            />
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useWindowScroll, useThrottle } from "@vueuse/core"
import { useI18n } from "vue-i18n"
import { useSettings } from "../../hooks/ghost/content/settings"
import { useTheme } from "../../hooks/theme"
import IconToggleTheme from "../ui/Icons/IconToggleTheme.vue"
import IconRss from "../ui/Icons/IconRss.vue"
import LangSelector from "./LangSelector/LangSelector.vue"
import SearchBox from "./search/SearchBox.vue"

export default defineComponent({
  components: { LangSelector, IconToggleTheme, IconRss, SearchBox },
  setup() {
    const { settings } = useSettings()
    const { toggleTheme } = useTheme()

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

    const i18n = useI18n()
    const feedUrl = computed(() => {
      const origin = location.origin
      const locale = i18n.locale.value
      return `https://feedly.com/i/subscription/feed/${origin}/${locale}/rss/`
    })

    watch(i18n.locale, clickOutside)

    return {
      settings,
      toggle,
      collapse,
      toggleTheme,
      clickOutside,
      hide,
      feedUrl,
    }
  },
})
</script>

<style lang="postcss" scoped>
nav {
  @apply transition-transform transform translate-y-0 ease-in-out duration-300;
  perspective: 1000px;
  backface-visibility: hidden;
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
