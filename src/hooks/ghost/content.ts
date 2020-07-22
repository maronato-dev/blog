import GhostContentAPI, {
  Pagination,
  SettingsResponse,
  PostOrPage,
  PostsOrPages,
} from "@tryghost/content-api"
import { ref, watch, computed, onBeforeMount, Ref, reactive, isRef } from "vue"
import axios, { AxiosError } from "axios"
import { useI18n, Composer } from "vue-i18n"
import { createGlobalState, useStorage } from "@vueuse/core"
import { useRouter } from "vue-router"
import dayjs from "dayjs"
import { useFetchData } from "../fetch"
import { useError } from "../layout"
import { useTitle } from "../meta"
import { useSEOTags } from "../seo"

interface BrowseResults<T> extends Array<T> {
  meta: { pagination: Pagination }
}

const createEmptyPostsOrPages = () => {
  const postsOrPages = ([] as unknown) as PostsOrPages
  postsOrPages.meta = {
    pagination: {
      page: 1,
      pages: 1,
      limit: 0,
      total: 0,
      next: null,
      prev: null,
    },
  }
  return postsOrPages
}

export const useGhostContentApi = () => {
  const api = new GhostContentAPI({
    url: import.meta.env.VITE_GHOST_API_URL as string,
    key: import.meta.env.VITE_GHOST_API_KEY as string,
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

export const useCurrentPageOrPost = (slug: Ref<string>) => {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const router = useRouter()
  const { trigger404 } = useError()

  const content = ref<PostOrPage | undefined>(undefined)

  const getContent = () => {
    const getLocaleFromSlug = (path: string) =>
      i18n.availableLocales.find(locale => path.startsWith(`${locale}-`))

    const slugLocale = getLocaleFromSlug(slug.value)
    let localizedSlug: string

    if (slugLocale) {
      localizedSlug = slug.value
      i18n.locale.value = slugLocale
    } else {
      localizedSlug = `${i18n.locale.value}-${slug.value}`
    }

    return api.posts
      .read(
        { slug: localizedSlug },
        { include: ["authors", "count.posts", "tags"] }
      )
      .catch(() =>
        api.pages.read(
          { slug: localizedSlug },
          { include: ["authors", "count.posts", "tags"] }
        )
      )
      .then(response => {
        content.value = response
        if (slugLocale) {
          // If content loaded using a localized slug, replace the path with non-localized slug
          const nonLocalizedSlug = slug.value.substr(slugLocale.length + 1)
          router.replace({
            name: "postOrPage",
            params: { slug: nonLocalizedSlug },
          })
        }
      })
      .catch(e => {
        trigger404()
        throw e
      })
  }
  const [fetch, fetchState] = useFetchData(getContent)

  // Reload on post/page change
  watch(slug, fetch)

  // Reload post when changing locale
  watch(i18n.locale, fetch)

  const contentTitle = computed(
    () => content.value && (content.value.meta_title || content.value.title)
  )
  useBlogTitle(contentTitle, fetchState)
  useSEOTags(content)

  return { content, fetch, fetchState }
}

export const useDefaultTitle = () => {
  const { settings } = useSettings()
  const title = computed(() => {
    return (
      (settings.value && (settings.value.meta_title || settings.value.title)) ||
      ""
    )
  })
  useTitle(title)
}

export const useFormattedTitle = (compTitle: string | Ref<string>) => {
  const { settings } = useSettings()

  const buildTitle = (comp: string) => {
    return `${comp} - ${
      (settings.value && (settings.value.meta_title || settings.value.title)) ||
      ""
    }`
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
    const blogTitle =
      (settings.value && (settings.value.meta_title || settings.value.title)) ||
      ""
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

const getGhostFormattedDate = (post: PostOrPage) => {
  return dayjs(post.published_at || new Date()).format("YYYY-MM-DD HH:mm:ss")
}

const useNextPost = (post: PostOrPage) => {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const next = ref<PostOrPage | undefined>(undefined)

  const fetchNextPost = () => {
    return api.posts
      .browse({
        limit: 1,
        include: ["tags", "authors"],
        filter: `slug:-${post.slug}+published_at:>'${getGhostFormattedDate(
          post
        )}'+tag:hash-${i18n.locale.value}`,
        order: "published_at asc",
      })
      .then(posts => posts[0] && removeLocaleFromSlug(i18n)(posts[0]))
  }

  const [fetch, fetchState] = useFetchData(async () => {
    next.value = await fetchNextPost()
  })

  return { next, fetch, fetchState }
}

const usePrevPost = (post: PostOrPage) => {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const prev = ref<PostOrPage | undefined>(undefined)

  const fetchPrevPost = () => {
    return api.posts
      .browse({
        limit: 1,
        include: ["tags", "authors"],
        filter: `slug:-${post.slug}+published_at:<'${getGhostFormattedDate(
          post
        )}'+tag:hash-${i18n.locale.value}`,
        order: "published_at desc",
      })
      .then(posts => posts[0] && removeLocaleFromSlug(i18n)(posts[0]))
  }

  const [fetch, fetchState] = useFetchData(async () => {
    prev.value = await fetchPrevPost()
  })

  return { prev, fetch, fetchState }
}

export const usePostsWithTag = (tag?: string, limit = 15) => {
  const api = useGhostContentApi()
  const i18n = useI18n()

  const fetchTagPosts = (page = 0) => {
    if (typeof tag === "undefined") {
      return Promise.resolve(createEmptyPostsOrPages())
    }
    return api.posts.browse({
      include: ["tags", "authors"],
      limit,
      page,
      filter: `tag:hash-${i18n.locale.value}+tag:${tag}`,
    })
  }

  const {
    content,
    loadMore,
    fetchState,
    canLoadMore,
    fetchInitial,
  } = useContentBrowser(fetchTagPosts)

  const meta = computed(() => content.value.meta)

  // Reload posts when changing locale
  watch(i18n.locale, fetchInitial)

  const posts = computed(() => content.value.map(removeLocaleFromSlug(i18n)))

  return { posts, loadMore, fetchState, canLoadMore, meta }
}

export const useRelatedPosts = (post: PostOrPage) => {
  const { next, fetchState: nextState } = useNextPost(post)
  const { prev, fetchState: prevState } = usePrevPost(post)
  const { posts, meta, fetchState: tagsState } = usePostsWithTag(
    post.primary_tag ? post.primary_tag.slug : undefined,
    4
  )
  const withTags = computed(() => posts.value.filter(p => p.id !== post.id))
  const withTagsTotal = computed(() => meta.value.pagination.total)

  const pending = computed(
    () => nextState.pending || prevState.pending || tagsState.pending
  )
  const error = computed(
    () => nextState.error || prevState.error || tagsState.error
  )

  return { next, prev, withTags, withTagsTotal, pending, error }
}
