import { onMounted } from "vue"
import { useRoute } from "vue-router"

export const useScrollToAnchorOnLoad = () => {
  // Navigate to anchor on load
  onMounted(() => {
    const route = useRoute()
    if (route.hash) {
      const el = document.querySelector(route.hash)
      if (el) {
        el.scrollIntoView()
      }
    }
  })
}
