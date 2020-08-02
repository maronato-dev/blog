<template>
  <div
    v-click-outside="clickOutside"
    class="relative inline-block z-20"
    @mouseenter="unfocus"
  >
    <div>
      <span class="rounded">
        <button
          id="search-menu"
          type="button"
          class="py-2 opacity-75 hover:opacity-100 font-medium focus:outline-none transition-opacity ease-in-out duration-200"
          aria-haspopup="true"
          aria-expanded="true"
          @click="toggle"
        >
          <icon-search class="w-6 h-6" />
        </button>
      </span>
    </div>
    <transition appear name="dropdown">
      <div v-if="show" class="absolute mt-2 rounded drop">
        <div class="rounded-md bg-white dark:bg-gray-800 shadow-lg">
          <div
            class="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div class="px-4 py-2 flex">
              <search-input
                v-model:query.trim="query"
                @keypress.enter="selectFocus"
                @keyup.up="focusUp"
                @keyup.down="focusDown"
              />
            </div>
            <template v-if="canSearch && !localizedResults.length">
              <div class="px-4 py-2 flex">
                {{ noResultsText }}
              </div>
            </template>
            <search-result
              v-for="(result, i) in localizedResults"
              v-else
              :key="result.data.doc.id"
              :result="result"
              :focus="i === focus"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue"
import { useThrottle } from "@vueuse/core"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useSearch } from "../../../hooks/search"
import IconSearch from "../../ui/Icons/IconSearch.vue"
import SearchInput from "./SearchInput.vue"
import SearchResult from "./SearchResult.vue"

export default defineComponent({
  components: { SearchInput, IconSearch, SearchResult },
  setup() {
    const show = ref(false)
    const focus = ref<number | undefined>()
    const toggle = () => (show.value = !show.value)
    const close = () => (show.value = false)

    const router = useRouter()
    router.beforeEach((_to, _from, next) => {
      close()
      return next()
    })

    const clickOutside = () => {
      if (show.value) {
        close()
      }
    }

    const query = ref("")
    watch(show, () => {
      query.value = ""
      focus.value = undefined
    })
    const throttleQuery = useThrottle(query, 400)

    const { search, results } = useSearch()
    const i18n = useI18n()
    const canSearch = computed(() => throttleQuery.value.length >= 3)
    watch(throttleQuery, () => {
      if (canSearch.value) {
        search(throttleQuery.value)
      } else {
        results.value = []
      }
    })
    const localizedResults = computed(() =>
      results.value
        .filter(result => result.data.doc.language === i18n.locale.value)
        .slice(0, 5)
    )
    const noResultsText = computed(() => i18n.t("navbar.search.no-results"))

    const focusUp = () => {
      const val = (typeof focus.value === "undefined" ? 0 : focus.value) - 1
      const n = localizedResults.value.length
      focus.value = ((val % n) + n) % n
    }
    const focusDown = () => {
      const val = (typeof focus.value === "undefined" ? -1 : focus.value) + 1
      const n = localizedResults.value.length
      focus.value = ((val % n) + n) % n
    }
    const unfocus = () => (focus.value = undefined)
    const selectFocus = () => {
      if (localizedResults.value.length > 0) {
        const focused =
          typeof focus.value === "undefined"
            ? localizedResults.value[0]
            : localizedResults.value[focus.value]
        const slug = focused.data.doc.slug
        if (focused.data.table === "tags") {
          return router.push({ name: "tag", params: { slug } })
        }
        return router.push({ name: "postOrPage", params: { slug } })
      }
    }

    return {
      query,
      localizedResults,
      show,
      clickOutside,
      toggle,
      canSearch,
      noResultsText,
      selectFocus,
      focusUp,
      focusDown,
      focus,
      unfocus,
    }
  },
})
</script>

<style scoped lang="postcss">
.drop {
  right: -4.5rem;
  @apply w-screen;
  @screen md {
    width: 20rem;
  }
}
.dropdown {
  left: -1rem;
}
.dropdown-enter-active {
  transition: all 100ms ease-out;
}
.dropdown-leave-active {
  transition: all 75ms ease-in;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 100;
  transform: scale(1);
}
</style>
