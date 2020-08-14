import { computed, ref } from "vue"
import { createGlobalStateAlt } from "./vueuse"

export const useGlobalOnline = createGlobalStateAlt(() => {
  const online = ref(navigator.onLine)
  addEventListener("online", () => {
    online.value = true
  })
  addEventListener("offline", () => {
    online.value = false
  })

  return online
})

export const useGlobalOffline = () => {
  const online = useGlobalOnline()
  const offline = computed(() => !online.value)
  return offline
}
