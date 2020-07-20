<template>
  <img class="max-w-full md:max-w-lg" :src="undraw500" />
  <h1 class="text-4xl font-thin py-10">{{ errorOcurred }}</h1>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { useI18n } from "vue-i18n"
import undraw500 from "../../assets/img/undraw/500.svg"

export default defineComponent(() => {
  const i18n = useI18n()
  const errorOcurred = computed(() => i18n.t("layout.error.500-message"))
  return { errorOcurred, undraw500 }
})
</script>
