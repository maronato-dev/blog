import { ref, readonly } from "vue"
import { createGlobalState } from "@vueuse/core"
import { useStorageAlt } from "../../../vueuse"
import { WorkerRequest, WorkerResponse } from "./workerTypes"

// eslint-disable-next-line import/no-unresolved
import GhostWorker from "./worker?worker"

const useLastSync = createGlobalState(() =>
  useStorageAlt("lastSync", new Date(0))
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
