import { Ref, ref, computed } from "vue"

export function usePaginateDBContent<T>(
  content: Ref<T[] | undefined>,
  pageSize = 15
) {
  const page = ref(1)
  const pages = computed(() =>
    typeof content.value !== "undefined"
      ? Math.ceil(content.value.length / pageSize)
      : 0
  )
  const paginatedContent = computed(() =>
    typeof content.value !== "undefined"
      ? content.value.slice(0, pageSize * page.value)
      : []
  )
  const canLoadMore = computed(() => page.value < pages.value)
  const loadMore = () => {
    if (canLoadMore.value) {
      page.value += 1
    }
  }

  return { content: paginatedContent, loadMore, canLoadMore }
}
