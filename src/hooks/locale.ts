import { Ref, watch, computed } from "vue"
import { createGlobalState, useStorage } from "@vueuse/core"
import { useI18n } from "vue-i18n"

type Locales = "pt" | "en"

export const useLocaleState = createGlobalState(() => {
  const preferredLangs = navigator.languages.map(l => l.split("-")[0])
  const availableLocales = ["pt", "en"]
  let locale = "en"
  preferredLangs.some(l => {
    if (availableLocales.includes(l)) {
      locale = l
      return true
    }
    return false
  })

  const state = useStorage("locale", locale) as Ref<Locales>
  return state
})

export const useLocaleSync = () => {
  const i18n = useI18n()
  const locale = useLocaleState()
  // Sync i18n changes
  watch(i18n.locale, () => (locale.value = i18n.locale.value as Locales))
  // Sync locale state changes
  watch(locale, () => (i18n.locale.value = locale.value))
  // Update html lang
  watch(
    i18n.locale,
    () => {
      document.documentElement.lang = i18n.locale.value
    },
    { immediate: true }
  )
}

export const useLocaleNames = () => {
  const i18n = useI18n()
  const localeNames: Record<Locales, string> = {
    pt: "Português",
    en: "English",
  }

  const getLocaleName = (locale: string) => localeNames[locale as Locales]
  const locale = computed(() => getLocaleName(i18n.locale.value))
  const locales = computed(() =>
    i18n.availableLocales.map(locale => ({
      locale,
      name: getLocaleName(locale),
    }))
  )
  return { locales, locale, getLocaleName }
}

export const useLocaleFlag = () => {
  const i18n = useI18n()
  const flagMap: Record<Locales, string> = {
    pt: "🇧🇷",
    en: "🇺🇸",
  }

  const getLocaleFlag = (locale: string) => flagMap[locale as Locales]
  const locale = computed(() => getLocaleFlag(i18n.locale.value))
  const locales = computed(() =>
    i18n.availableLocales.map(locale => ({
      locale,
      flag: getLocaleFlag(locale),
    }))
  )
  return { locales, locale, getLocaleFlag }
}

export const useLocaleNameAndFlag = () => {
  const i18n = useI18n()
  const { getLocaleName } = useLocaleNames()
  const { getLocaleFlag } = useLocaleFlag()

  const getNameAndFlag = (locale: string) => ({
    locale,
    name: getLocaleName(locale),
    flag: getLocaleFlag(locale),
  })
  const locale = computed(() => getNameAndFlag(i18n.locale.value))
  const locales = computed(() => i18n.availableLocales.map(getNameAndFlag))
  return { locale, locales }
}
