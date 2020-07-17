import { ref, Ref, computed } from "vue"
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import type { PostOrPage, Pagination } from "@tryghost/content-api"
import { useFetchData } from "../fetch"

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
  const post = computed(() => response.value?.data.posts[0])
  return { post, requestState }
}
