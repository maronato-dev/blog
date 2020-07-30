<template>
  <div class="block mt-2 text-lg text-current">
    <div
      class="flex justify-between cursor-pointer animated-underline"
      @click="toggle"
    >
      <div class="flex">
        <div class="text-lg leading-5">{{ locale.flag }}</div>
        <div class="text-lg leading-5 ml-3">{{ locale.name }}</div>
      </div>
      <svg
        :class="{ 'rotate-180': show }"
        class="-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <div class="drawer w-full" :class="{ show }">
      <div
        v-for="l in locales"
        :key="l.locale"
        class="px-4 py-3 text-sm leading-5 hover:bg-gray-100 dark-hover:bg-gray-800 focus:bg-gray-100 cursor-pointer flex"
        @click="setLocale(l)"
      >
        <div class="text-lg leading-5">{{ l.flag }}</div>
        <div class="text-sm leading-5 ml-2">{{ l.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useLocaleNameAndFlag } from "../../../hooks/locale"

export default defineComponent({
  setup() {
    const i18n = useI18n()
    const { locale, locales } = useLocaleNameAndFlag()
    const show = ref(false)
    const toggle = () => (show.value = !show.value)
    const close = () => (show.value = false)

    const clickOutside = () => {
      if (show.value) {
        close()
      }
    }

    const setLocale = ({ locale }: { locale: string }) => {
      i18n.locale.value = locale
      close()
    }

    return { locale, locales, toggle, show, clickOutside, setLocale }
  },
})
</script>
<style scoped lang="postcss">
.drawer {
  max-height: 0px;
  @apply transition-all duration-200;

  &.show {
    max-height: 300px;
  }
}
</style>
