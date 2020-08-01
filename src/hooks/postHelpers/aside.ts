import { computed } from "vue"
import { useShowTOC } from "./toc"
import { usePostFootnotes } from "./footnotes"

export const useAside = () => {
  const showTOC = useShowTOC()
  const { count: footnoteCount } = usePostFootnotes()
  const aside = computed(() => footnoteCount.value > 0 || showTOC.value)
  return aside
}
