import GLightbox from "glightbox"
import { onMounted, onUnmounted } from "vue"
import { useMeta } from "../../../hooks/meta"

export const useGlightbox = () => {
  const { link } = useMeta()
  const linkValue = link.value ? link.value : []
  linkValue.push({
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css",
  })
  link.value = linkValue
  const glightbox = new GLightbox({
    selector: ".kg-image,.kg-gallery-image img",
  })
  onMounted(() => {
    glightbox.reload()
  })
  onUnmounted(() => {
    glightbox.destroy()
  })
}
