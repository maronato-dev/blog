import { reactive, onBeforeMount } from "vue"

export const useFetchData = <E extends Error = Error>(
  callback: () => Promise<void>,
  fetchOnLoad = true
) => {
  const fetchState = reactive({
    pending: true,
    error: null as E | null,
  })
  const fetch = async () => {
    fetchState.pending = true
    fetchState.error = null
    try {
      await callback()
    } catch (e) {
      fetchState.error = e
    } finally {
      fetchState.pending = false
    }
  }
  if (fetchOnLoad) {
    onBeforeMount(fetch)
  }
  return [fetch, fetchState] as [typeof fetch, typeof fetchState]
}
