import { createGlobalState, useStorage } from "@vueuse/core"
import { SettingsResponse } from "@tryghost/content-api"
import { computed, onBeforeMount, Ref } from "vue"
import { AxiosError } from "axios"
import { useFetchData } from "../../fetch"
import { useGhostContentApi } from "./api"

const useSettingsState = createGlobalState(() => {
  const store = useStorage("ghost-settings", {}) as Ref<SettingsResponse>
  const settings = computed<SettingsResponse | null>({
    get() {
      if (Object.keys(store.value).length === 0) {
        return null
      }
      return store.value
    },
    set(val: SettingsResponse | null) {
      const validVal = val ? val : ({} as SettingsResponse)
      store.value = validVal
    },
  })
  return settings
})

export const useSettings = () => {
  const api = useGhostContentApi()
  const settingsState = useSettingsState()

  const fetchSettings = () => {
    return api.settings.browse()
  }
  const [fetch, fetchState] = useFetchData<AxiosError>(async () => {
    settingsState.value = await fetchSettings()
  }, false)

  if (!settingsState.value) {
    onBeforeMount(fetch)
  }

  return { settings: settingsState, fetchState, fetch }
}
