import { computed, Ref, watchEffect } from "vue"
import { useStorage, usePreferredColorScheme } from "@vueuse/core"
import { useMeta } from "./meta"

type ColorOptions = "light" | "dark"
type StoredTheme = ColorOptions | "system"

function createGlobalState<T>(factory: () => T) {
  const state = factory()
  return () => state
}

const useThemeState = createGlobalState(() => {
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
      console.log("setting theme to", value)
      manualValue.value = value
    },
  })

  return { preference, theme }
})

export const useTheme = () => {
  const { theme, preference } = useThemeState()
  const { bodyAttrs } = useMeta()

  // Update body class
  watchEffect(() => {
    console.log("updating body class to", theme.value)
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
