import {
  ref,
  toRefs,
  reactive,
  Ref,
  onUnmounted,
  readonly,
  onMounted,
  onBeforeMount,
} from "vue"

export function useIntersectionObserver(
  targetRef: Ref<Element | null>,
  options?: IntersectionObserverInit,
  observeOnMount = true
) {
  const entry = reactive<{
    isFullyVisible: boolean
    intersectionRatio: number
    isIntersecting: boolean
  }>({
    intersectionRatio: 0,
    isIntersecting: false,
    isFullyVisible: false,
  })

  const observer = ref<IntersectionObserver | undefined>()

  onBeforeMount(() => {
    observer.value = new IntersectionObserver(([targetEntry]) => {
      entry.intersectionRatio = targetEntry.intersectionRatio
      entry.isIntersecting = targetEntry.isIntersecting
      entry.isFullyVisible = targetEntry.intersectionRatio >= 1
    }, options)
  })

  const observe = () => {
    if (observer.value && targetRef.value) {
      observer.value.observe(targetRef.value)
    }
  }

  onMounted(() => {
    if (observeOnMount) {
      observe()
    }
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return toRefs(readonly(entry))
}
