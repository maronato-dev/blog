import { ref, Ref, computed } from "vue"
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import type { PostOrPage, Pagination } from "@tryghost/content-api"
import { useFetchData } from "../../fetch"
import { localizePostOrPage } from "../content/utils"

interface RequestParams extends AxiosRequestConfig {
  endpoint: string
}
interface RequestConfig {
  fetchOnLoad?: boolean
}

const useAdminAPIRequest = <T, R = AxiosResponse<T>>(
  params: RequestParams,
  config: RequestConfig = { fetchOnLoad: true }
) => {
  const response = ref(null) as Ref<R | null>
  if (!params.url) {
    const ghostApi = import.meta.env.VITE_GHOST_API_URL
    params.url = `${ghostApi}/ghost/api/v3/admin${params.endpoint}`
  }
  const [fetch, requestState] = useFetchData<AxiosError<T>>(async () => {
    response.value = await axios.request(params)
  }, !!config.fetchOnLoad)

  return { fetch, requestState, response }
}

interface BrowsePostResponse {
  posts: PostOrPage[]
  meta: { pagination: Pagination }
}

interface BrowsePageResponse {
  pages: PostOrPage[]
  meta: { pagination: Pagination }
}

export const usePreviewPost = (uuid: string) => {
  const request: RequestParams = {
    params: {
      filter: `uuid:${uuid}+status:draft`,
      formats: "html",
    },
    endpoint: "/posts",
  }
  const { response, requestState } = useAdminAPIRequest<BrowsePostResponse>(
    request
  )
  const post = computed(() =>
    response.value && response.value.data.meta.pagination.total > 0
      ? localizePostOrPage(response.value.data.posts[0])
      : undefined
  )
  return { post, requestState }
}

export const usePreviewPage = (uuid: string) => {
  const request: RequestParams = {
    params: {
      filter: `uuid:${uuid}+status:draft`,
      formats: "html",
    },
    endpoint: "/pages",
  }
  const { response, requestState } = useAdminAPIRequest<BrowsePageResponse>(
    request
  )
  const page = computed(() =>
    response.value && response.value.data.meta.pagination.total > 0
      ? localizePostOrPage({ ...response.value.data.pages[0], page: true })
      : undefined
  )
  return { page, requestState }
}

export const usePreviewPostOrPage = (uuid: string) => {
  const { post, requestState: postState } = usePreviewPost(uuid)
  const { page, requestState: pageState } = usePreviewPage(uuid)

  const loadedPost = computed(() => !!post.value)
  const loadedPage = computed(() => !!page.value)

  const requestState = computed(() => ({
    pending: postState.pending || (!loadedPost.value && pageState.pending),
    error: postState.error || (!loadedPost.value ? pageState.error : null),
  }))

  const content = computed(() =>
    loadedPost.value ? post.value : loadedPage.value ? page.value : undefined
  )

  return { content, requestState }
}
