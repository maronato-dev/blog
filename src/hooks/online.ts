import { computed, ref } from "vue"

export const useGlobalOnline = (() => {
  const online = ref(navigator.onLine)
  addEventListener("online", () => {
    online.value = true
  })
  addEventListener("offline", () => {
    online.value = false
  })

  return () => online
})()

export const useGlobalOffline = () => {
  const online = useGlobalOnline()
  const offline = computed(() => !online.value)
  return offline
}
