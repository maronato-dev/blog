import { useStorage, usePreferredColorScheme } from "@vueuse/core"
import { computed, Ref, watchEffect } from "vue"
import { useMeta } from "./meta"

type ColorOptions = "light" | "dark"
type StoredTheme = ColorOptions | "system"

const useThemeState = () => {
  const preference = usePreferredColorScheme()
  const manualValue = useStorage("theme-value", "system") as Ref<StoredTheme>

  const theme = computed({
    get() {
      const preferenceOrDark =
        preference.value === "no-preference" ? "dark" : preference.value
      return manualValue.value !== "system"
        ? manualValue.value
        : preferenceOrDark
    },
    set(value: ColorOptions) {
      manualValue.value = value
    },
  })

  return { preference, theme }
}

export const useTheme = () => {
  const { theme, preference } = useThemeState()
  const { bodyAttrs } = useMeta()

  // Update body class
  watchEffect(() => {
    bodyAttrs.value = { class: `${theme.value}-mode` }
  })

  const isDark = computed(() => theme.value === "dark")
  const isLight = computed(() => theme.value === "light")
  const toggleTheme = () => {
    if (isDark.value) {
      theme.value = "light"
    } else {
      theme.value = "dark"
    }
  }

  return { theme, isDark, isLight, preference, toggleTheme }
}
