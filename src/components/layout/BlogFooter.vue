<template>
  <footer
    class="relative bg-white py-6 px-8 dark:bg-gray-900 dark:text-gray-100 w-full z-10 border-t border-gray-300 dark:border-gray-800"
  >
    <div
      class="container mx-auto flex items-center text-center justify-around md:justify-between flex-wrap flex-col md:flex-row content-around"
    >
      <div>
        <span class="text-gray-600 dark:text-gray-600 ml-1">
          &copy; {{ year }}.
        </span>
        <span class="text-gray-600 dark:text-gray-600 ml-1">
          {{ madeByText }}
        </span>
        <a class="ml-1" href="https://shrt.maronato.dev/github">Maronato</a>
        <span class="text-gray-600 dark:text-gray-600">.</span>
      </div>
      <div>
        <a href="https://shrt.maronato.dev/gh-blog">GitHub</a>
        <span class="mx-1 my-0 opacity-50">•</span>
        <router-link to="/privacy">{{ pivacyPolicyText }}</router-link>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue"
import { useI18n } from "vue-i18n"
export default defineComponent(() => {
  const date = new Date()
  const year = date.getFullYear()

  const i18n = useI18n()
  const pivacyPolicyText = computed(() => i18n.t("footer.privacy-policy"))

  const madeByText = computed(() => i18n.t("footer.made-by"))

  return { year, pivacyPolicyText, madeByText }
})
</script>
