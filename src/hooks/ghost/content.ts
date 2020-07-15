import GhostContentAPI, {
  Pagination,
  SettingsResponse,
  PostOrPage,
} from "@tryghost/content-api"
import {
  ref,
  watch,
  computed,
  onBeforeMount,
  Ref,
  watchEffect,
  reactive,
  isRef,
} from "vue"
import axios, { AxiosError } from "axios"
import { useI18n, Composer } from "vue-i18n"
import { useFetchData } from "../fetch"
import { useError } from "../layout"
import { useTitle, useMeta } from "../meta"
import { createGlobalState, useStorage } from "@vueuse/core"

interface BrowseResults<T> extends Array<T> {
  meta: { pagination: Pagination }
}

export const useGhostContentApi = () => {
  const { protocol, hostname } = window.location
  const url = `${protocol}//${hostname}`
  const api = new GhostContentAPI({
    url,
    key: "f3d212e9b66201c7f1cc49c1a0",
    version: "v3",
  })
  return api
}

const createDefaultContentResponse = <C>() => {
  const response = ([] as unknown) as BrowseResults<C>
  response.meta = {
    pagination: {
      page: 1,
      limit: 0,
      pages: 1,
      total: 0,
      next: null,
      prev: null,
    },
  }
  return response
}

const useContentBrowser = <C, B extends BrowseResults<C>>(
  fetchPage: (page: number) => Promise<B>
) => {
  const content = ref(createDefaultContentResponse<C>() as B) as Ref<B>

  const [fetchInitial, fetchState] = useFetchData<AxiosError>(async () => {
    content.value = await fetchPage(0)
  })

  const loadMore = async () => {
    const next = content.value.meta.pagination.next

    if (next) {
      const newContent = await fetchPage(next)
      content.value.push(...newContent)
      content.value.meta = newContent.meta
    }
  }

  const pagination = computed(() => content.value.meta.pagination)

  const canLoadMore = computed(
    () => pagination.value.page < pagination.value.pages
  )
  return { content, loadMore, fetchState, canLoadMore, fetchInitial }
}

export const removeLocaleFromSlug = (i18n: Composer) => (
  content: PostOrPage
) => {
  for (const locale of i18n.availableLocales || []) {
    const localeTag = `${locale}-`
    if (content.slug.startsWith(localeTag)) {
      content.slug = content.slug.replace(localeTag, "")
      return content
    }
  }
  return content
}

export const usePosts = (limit = 15) => {
  const api = useGhostContentApi()
  const i18n = useI18n()

  const fetchLocalePosts = (page = 0) => {
    return api.posts.browse({
      include: ["authors", "tags"],
      limit,
      page,
      filter: [`tags:[hash-${i18n.locale.value}]`],
    })
  }

  const {
    content,
    loadMore,
    fetchState,
    canLoadMore,
    fetchInitial,
  } = useContentBrowser(fetchLocalePosts)

  // Reload posts when changing locale
  watch(i18n.locale, fetchInitial)

  const posts = computed(() => content.value.map(removeLocaleFromSlug(i18n)))

  return { posts, loadMore, fetchState, canLoadMore }
}

export const useTags = () => {
  const api = useGhostContentApi()

  const fetchTags = () => {
    return api.tags.browse({
      limit: "all",
    })
  }
  const { content, fetchState } = useContentBrowser(fetchTags)

  return { tags: content, fetchState }
}

const useSettingsState = createGlobalState(() => {
  const store = useStorage("ghost-settings", {}) as Ref<SettingsResponse>
  const settings = computed<SettingsResponse | null>({
    get() {
      if (Object.keys(store.value).length === 0) {
        return null
      }
      return store.value
    },
    set(val: SettingsResponse | null) {
      const validVal = val ? val : ({} as SettingsResponse)
      store.value = validVal
    },
  })
  return settings
})

export const useSettings = () => {
  const api = useGhostContentApi()
  const settingsState = useSettingsState()

  const fetchSettings = () => {
    return api.settings.browse()
  }
  const [fetch, fetchState] = useFetchData<AxiosError>(async () => {
    settingsState.value = await fetchSettings()
  }, false)

  if (!settingsState.value) {
    onBeforeMount(fetch)
  }

  return { settings: settingsState, fetchState, fetch }
}

export const useCurrentPageOrPost = (slug: string) => {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const { trigger404 } = useError()

  const content = ref<PostOrPage | undefined>(undefined)

  const getContent = () => {
    const localeSlug = `${i18n.locale.value}-${slug}`

    return api.posts
      .read(
        { slug: localeSlug },
        { include: ["authors", "count.posts", "tags"] }
      )
      .catch(() =>
        api.pages.read(
          { slug: localeSlug },
          { include: ["authors", "count.posts", "tags"] }
        )
      )
      .then(response => {
        content.value = response
      })
      .catch(e => {
        trigger404()
        throw e
      })
  }
  const [fetch, fetchState] = useFetchData(getContent)

  // Reload post when changing locale
  watch(i18n.locale, fetch)

  const contentTitle = computed(() => content.value?.title)
  useBlogTitle(contentTitle, fetchState)

  return { content, fetch, fetchState }
}

export const useDefaultTitle = () => {
  const { settings } = useSettings()
  const title = computed(() => {
    return settings.value?.title || ""
  })
  useTitle(title)
}

export const useFormattedTitle = (compTitle: string | Ref<string>) => {
  const { settings } = useSettings()

  const buildTitle = (comp: string) => {
    return `${comp} - ${settings.value?.title || ""}`
  }

  const title = computed(() => {
    return buildTitle(isRef(compTitle) ? compTitle.value : compTitle)
  })
  useTitle(title)
}

export const useBlogTitle = (
  resolved: Ref<string | undefined>,
  fetchState: ReturnType<typeof useFetchData>[1]
) => {
  const i18n = useI18n()
  const { settings } = useSettings()

  const title = computed(() => {
    const blogTitle = settings.value?.title || ""
    if (fetchState.pending) {
      return i18n.t("postOrPage.head.title.loading", { blogTitle })
    } else if (fetchState.error) {
      return i18n.t("postOrPage.head.title.error", { blogTitle })
    } else {
      return i18n.t("postOrPage.head.title.content", {
        title: resolved.value,
        blogTitle,
      })
    }
  })
  useTitle(title)
}

const getCurrentUrl = () => {
  if (typeof window === "undefined") {
    return undefined
  }
  const location = window.location
  return `${location.origin}${location.pathname}`
}

export const useSocialMetaTags = (content?: Ref<PostOrPage | undefined>) => {
  const { meta } = useMeta()
  const { settings } = useSettings()
  watchEffect(() => {
    meta.value = [
      {
        name: "description",
        content:
          content?.value?.meta_description ||
          content?.value?.custom_excerpt ||
          content?.value?.excerpt ||
          settings.value?.meta_description ||
          settings.value?.description ||
          "",
      },
      { property: "og:site_name", content: settings.value?.title || "" },
      { property: "og:type", content: "article" },
      {
        property: "og:title",
        content:
          content?.value?.og_title ||
          content?.value?.title ||
          settings.value?.og_title ||
          settings.value?.title ||
          "",
      },
      {
        property: "og:description",
        content:
          content?.value?.og_description ||
          content?.value?.custom_excerpt ||
          content?.value?.excerpt ||
          settings.value?.og_description ||
          settings.value?.description ||
          "",
      },
      {
        property: "og:url",
        content:
          getCurrentUrl() || content?.value?.url || settings.value?.url || "",
      },
      {
        property: "og:image",
        content:
          content?.value?.og_image ||
          content?.value?.feature_image ||
          settings.value?.og_image ||
          "",
      },
      {
        property: "article:published_time",
        content: content?.value?.published_at || "",
      },
      {
        property: "article:modified_time",
        content: content?.value?.updated_at || "",
      },
      {
        property: "article:tag",
        content: content?.value?.primary_tag?.name || "",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content:
          content?.value?.twitter_title ||
          content?.value?.title ||
          settings.value?.twitter_title ||
          settings.value?.title ||
          "",
      },
      {
        name: "twitter:description",
        content:
          content?.value?.twitter_description ||
          content?.value?.custom_excerpt ||
          content?.value?.excerpt ||
          settings.value?.twitter_description ||
          settings.value?.description ||
          "",
      },
      {
        name: "twitter:url",
        content:
          getCurrentUrl() || content?.value?.url || settings.value?.url || "",
      },
      {
        name: "twitter:image",
        content:
          content?.value?.twitter_image ||
          content?.value?.feature_image ||
          settings.value?.twitter_image ||
          "",
      },
    ]
  })
}

export const useSubscribe = (emailRef: Ref<string>) => {
  const state = reactive({
    pending: false,
    error: null as Error | null,
    success: false,
  })
  const subscribe = async () => {
    state.pending = true
    state.error = null
    state.success = false
    try {
      await axios({
        url: "/members/api/send-magic-link/",
        method: "POST",
        data: {
          email: emailRef.value,
          emailType: "subscribe",
        },
      })
      state.success = true
    } catch (e) {
      state.error = e
    } finally {
      state.pending = false
    }
  }
  return subscribe
}
