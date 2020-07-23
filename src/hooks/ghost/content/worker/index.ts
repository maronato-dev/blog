import { Ref, ref, watch, readonly } from "vue"
import { createGlobalState } from "@vueuse/core"
import { WorkerRequest, WorkerResponse } from "./workerTypes"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GhostWorker from "./worker?worker"

const useLocalStorage = <T>(key: string, defaultData: T) => {
  const data = ref<T>(defaultData) as Ref<T>
  const storage = localStorage
  function read() {
    let raw = storage.getItem(key)
    if (!raw) {
      raw = JSON.stringify(defaultData)
      storage.setItem(key, raw)
    } else {
      data.value = JSON.parse(raw)
    }
  }
  read()
  addEventListener("storage", read)
  watch(
    data,
    () => {
      const str = JSON.stringify(data.value)
      storage.setItem(key, str)
    },
    { flush: "post", deep: true }
  )
  return data
}

const useLastSync = createGlobalState(() =>
  useLocalStorage("lastSync", new Date(0))
)

export const useDBSyncComplete = (() => {
  const isComplete = ref(false)
  const setComplete = (value: boolean) => {
    isComplete.value = value
  }

  return () => ({ isComplete: readonly(isComplete), setComplete })
})()

export function useDatabaseSync() {
  const lastSync = useLastSync()
  const { setComplete } = useDBSyncComplete()

  const sync = async () => {
    setComplete(false)
    const worker = new GhostWorker()
    const request: WorkerRequest = {
      action: "sync",
      data: {
        lastSync: lastSync.value,
      },
    }
    worker.postMessage(request)
    worker.onmessage = event => {
      const response: WorkerResponse = event.data
      if (response.action === "sync") {
        lastSync.value = new Date()
        setComplete(true)
      }
    }
  }

  return sync
}
