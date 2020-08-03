import { ref, Ref, computed, watch } from "vue"
import { useThrottle } from "@vueuse/core"
import { DocumentResult } from "../workers/search"
import { WorkerResponse, WorkerRequest } from "../workers/workerTypes"
// eslint-disable-next-line import/no-unresolved
import Search from "../workers/search?worker"
import { createGlobalStateAlt } from "./vueuse"

const useSearchWorker = createGlobalStateAlt(() => {
  const search = new Search()
  return search
})

export const useSearch = (
  onMessageCallback?: (response: WorkerResponse) => void
) => {
  const worker = useSearchWorker()
  const results = ref<DocumentResult[]>([])

  const onSearchFinished = (response: WorkerResponse) => {
    if (response.action === "search" && response.status === "success") {
      results.value = response.results
    }
  }
  const onMessage = (event: MessageEvent) => {
    const response: WorkerResponse = event.data
    if ("action" in response && response.action === "search") {
      onSearchFinished(response)
      onMessageCallback && onMessageCallback(response)
    }
  }
  worker.onmessage = onMessage

  const search = (query: string) => {
    const request: WorkerRequest = {
      action: "search",
      data: {
        query,
      },
    }
    worker.postMessage(request)
  }

  return { search, results }
}

export const useSearchAsYouType = (query: Ref<string>) => {
  const loading = ref(false)
  const { search, results: completeResults } = useSearch(
    () => (loading.value = false)
  )

  const throttledQuery = useThrottle(query, 400)

  const shouldSearch = computed(() => query.value.length >= 3)
  watch(query, () => {
    if (shouldSearch.value) {
      loading.value = true
    } else {
      loading.value = false
    }
  })
  watch(throttledQuery, () => {
    if (shouldSearch.value) {
      search(throttledQuery.value)
    } else {
      completeResults.value = []
    }
  })

  const noResults = computed(
    () => !loading.value && shouldSearch.value && results.value.length === 0
  )

  const results = computed(() =>
    completeResults.value.map(result => result.data)
  )

  return { results, loading, noResults }
}
