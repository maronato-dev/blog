import { reactive, computed, toRefs, watch } from "vue"
import { createGlobalState } from "@vueuse/core"
import { useI18n } from "vue-i18n"
import DefaultLayout from "../layouts/Default.vue"
import ErrorLayout from "../layouts/Error.vue"
import LoadingLayout from "../layouts/Loading.vue"
import { useMeta } from "./meta"

export const components = {
  DefaultLayout,
  ErrorLayout,
  LoadingLayout,
}

type Layout = "default" | "error" | "loading"
interface Error {
  code: number
  message: string
}

interface LayoutState {
  layout: Layout
  error: Error | null
}

const useLayoutState = createGlobalState(() => {
  const state = reactive<LayoutState>({
    layout: "default",
    error: null,
  })
  watch(
    () => state.layout,
    () => {
      if (state.layout !== "error") {
        state.error = null
      }
    }
  )
  return state
})

export const useLayout = () => {
  const state = useLayoutState()

  return { ...toRefs(state) }
}

export const useError = () => {
  const { layout, error } = useLayout()
  const triggerError = (err: Error) => {
    layout.value = "error"
    error.value = err
  }
  const trigger404 = () => {
    triggerError({ code: 404, message: "layout.error.404-message" })
  }
  const trigger500 = () => {
    triggerError({ code: 500, message: "layout.error.500-message" })
  }
  return { trigger404, trigger500, triggerError }
}

export const useLayoutComponent = () => {
  const { layout, error } = useLayout()
  const layoutMap = {
    default: DefaultLayout,
    error: ErrorLayout,
    loading: LoadingLayout,
  }
  const component = computed(() => {
    return layoutMap[layout.value].name || "div"
  })

  // Reset on locale change
  const i18n = useI18n()
  watch(i18n.locale, () => {
    layout.value = "default"
  })

  // Set noindex on error
  const { meta } = useMeta()
  watch(layout, () => {
    let metaArray = meta.value || []
    metaArray = metaArray.filter(m => m.name !== "robots")
    if (layout.value === "error") {
      metaArray.push({ name: "robots", content: "noindex" })
      metaArray.push({
        name: "prerender-status-code",
        content: error.value ? error.value.code.toString() : "404",
      })
    }
    meta.value = metaArray
  })

  return component
}
