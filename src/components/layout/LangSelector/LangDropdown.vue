<template>
  <dropdown :selected="selected" :options="options" @change="setLocale" />
</template>

<script lang="ts">
import { defineComponent, computed, UnwrapRef } from "vue"
import { useI18n } from "vue-i18n"
import Dropdown from "../../ui/Dropdown.vue"
import { useLocaleNameAndFlag } from "../../../hooks/locale"

export default defineComponent({
  components: { Dropdown },
  setup() {
    const i18n = useI18n()
    const { locale, locales } = useLocaleNameAndFlag()

    const toOption = (option: UnwrapRef<typeof locale>) => ({
      text: option.name,
      icon: option.flag,
      value: option.locale,
    })

    const selected = computed(() => toOption(locale.value))
    const options = computed(() => locales.value.map(l => toOption(l)))

    const setLocale = (locale: string) => {
      i18n.locale.value = locale
    }

    return { selected, options, setLocale }
  },
})
</script>
