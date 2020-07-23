import { computed, Ref, isRef } from "vue"
import { useSettings } from "./settings"
import { useTitle } from "../../meta"

export const useDefaultTitle = () => {
  const { settings } = useSettings()
  const title = computed(() => {
    return (
      (settings.value && (settings.value.meta_title || settings.value.title)) ||
      ""
    )
  })
  useTitle(title)
}

export const useFormattedTitle = (compTitle: string | Ref<string>) => {
  const { settings } = useSettings()

  const buildTitle = (comp: string) => {
    return `${comp} - ${
      (settings.value && (settings.value.meta_title || settings.value.title)) ||
      ""
    }`
  }

  const title = computed(() => {
    return buildTitle(isRef(compTitle) ? compTitle.value : compTitle)
  })
  useTitle(title)
}
