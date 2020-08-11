import { Ref, computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { provideGlobalCurrentPostOrPage } from "../../postHelpers/globalPost"
import {
  useCurrentDBPageOrPost,
  useDBPosts,
  useDBPostsWithTag,
} from "./db/posts"
import { usePaginateDBContent } from "./db/utils"
import { useCurrentAPIPageOrPost } from "./api/posts"

import { parseSlugLocale } from "./utils"
import { useCurrentTag } from "./tags"

export function usePosts(pageSize = 15) {
  const dbPosts = useDBPosts()

  // dynamic posts
  const { content: posts, canLoadMore, loadMore } = usePaginateDBContent(
    dbPosts,
    pageSize
  )

  const loading = computed(() => {
    return typeof dbPosts.value === "undefined"
  })

  return { posts, loading, canLoadMore, loadMore }
}

export const useCurrentPageOrPost = (slug: Ref<string>) => {
  const dbContent = useCurrentDBPageOrPost(slug)
  const {
    content: apiContent,
    loading: loadingApiContent,
    loadPost: loadAPIPost,
  } = useCurrentAPIPageOrPost(slug)

  // Load API post only if post was not found on the database
  watch(dbContent, value => value === null && loadAPIPost())

  const loading = computed(() => {
    // If dbContent is undefined, is loading from db
    if (typeof dbContent.value === "undefined") {
      return true
    }
    // If was not found on db, is loading from API
    if (dbContent.value === null) {
      return loadingApiContent.value
    }
    // Else, not loading
    return false
  })

  const content = computed(() =>
    loading.value ? undefined : dbContent.value || apiContent.value
  )

  provideGlobalCurrentPostOrPage(content)

  // Update locale if post has a different locale than the current one
  const i18n = useI18n()
  const router = useRouter()
  const route = useRoute()
  watch(content, () => {
    if (content.value) {
      const { hasLocale, locale, nonLocalized } = parseSlugLocale(slug.value)
      if (hasLocale) {
        if (locale !== i18n.locale.value) {
          i18n.locale.value = locale
        }
        router.replace({
          name: "postOrPage",
          params: { slug: nonLocalized },
          hash: route.hash,
        })
      }
    }
  })

  return { content, loading }
}

export function usePostsWithTag(tagId: Ref<string | undefined>, pageSize = 15) {
  const dbPosts = useDBPostsWithTag(tagId)

  const total = computed(() => dbPosts.value.length)

  const { content: posts, canLoadMore, loadMore } = usePaginateDBContent(
    dbPosts,
    pageSize
  )

  return { posts, canLoadMore, loadMore, total }
}

export function usePostsWithCurrentTag(slug: Ref<string>, pageSize = 15) {
  const { tag, loading } = useCurrentTag(slug)

  const tagId = computed(() => tag.value && tag.value.id)
  const { posts, canLoadMore, loadMore, total } = usePostsWithTag(
    tagId,
    pageSize
  )

  return { posts, canLoadMore, loadMore, loading, tag, total }
}
