import { ref } from "vue"
import { DocumentResult } from "../workers/search"
import { WorkerResponse, WorkerRequest } from "../workers/workerTypes"
// eslint-disable-next-line import/no-unresolved
import Search from "../workers/search?worker"
import { createGlobalStateAlt } from "./vueuse"

const useSearchWorker = createGlobalStateAlt(() => {
  const search = new Search()
  return search
})

export const useSearch = () => {
  const worker = useSearchWorker()
  const results = ref<DocumentResult[]>([])

  const onSearchFinished = (event: MessageEvent) => {
    const response: WorkerResponse = event.data
    if (response.action === "search" && response.status === "success") {
      results.value = response.results
    }
  }
  worker.onmessage = onSearchFinished

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
