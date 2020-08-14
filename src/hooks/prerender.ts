import { ref, watch, readonly } from "vue"

export const usePrerenderReady = () => {
  const ready = ref(window.prerenderReady)

  watch(ready, () => {
    window.prerenderReady = ready.value
  })

  const markReady = () => {
    ready.value = true
  }

  return { markReady, ready: readonly(ready) }
}
