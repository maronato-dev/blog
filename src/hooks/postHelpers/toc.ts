import { InjectionKey, Ref, ref, watch, provide, inject, computed } from "vue"
import { useGlobalCurrentPostOrPage } from "./globalPost"

interface Heading {
  type: "H1" | "H2" | "H3" | "H4"
  id: string
  text: string
  el: Element
}

type Tags = Heading["type"]

export type TOC = Heading[]

const removeAnchor = (str: string): string =>
  str[str.length - 1] === "#" ? removeAnchor(str.slice(0, str.length - 1)) : str

const makeHeading = (element: Element): Heading => {
  return {
    type: element.tagName as Tags,
    id: element.id,
    text: removeAnchor(element.textContent || ""),
    el: element,
  }
}

export const buildToc = (root: Element | null): TOC => {
  if (!root) {
    return []
  }
  return Array.from(root.querySelectorAll("h1, h2, h3")).map(makeHeading)
}

const tocInjectionKey: InjectionKey<Ref<TOC>> = Symbol("Table of contents")

export const provideTOC = (element: Ref<Element | null>) => {
  const toc = ref<TOC>([])

  const updateTOC = () => {
    toc.value = buildToc(element.value)
  }

  watch(element, updateTOC, { immediate: true })
  provide(tocInjectionKey, toc)

  return { toc, updateTOC }
}

export const useTOC = () => {
  const toc = inject(tocInjectionKey, ref([]))
  return toc
}

export const useShowTOC = () => {
  const postOrPage = useGlobalCurrentPostOrPage()
  const showToc = computed(
    () =>
      !!postOrPage.value &&
      (!postOrPage.value.reading_time
        ? false
        : postOrPage.value.reading_time >= 1)
  )
  return showToc
}
