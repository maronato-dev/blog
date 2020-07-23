import { computed, watch, Ref } from "vue"
import {
  useDBPosts,
  useCurrentDBPageOrPost,
  paginateDBContent,
} from "./db/posts"
import { useDBSyncComplete } from "./worker"
import { useAPIPosts, useCurrentAPIPageOrPost } from "./api/posts"

export function usePosts(pageSize = 15) {
  const dbPosts = useDBPosts()
  const { isComplete } = useDBSyncComplete()

  const {
    posts: apiPosts,
    loading: loadingApiPosts,
    stopWatch: stopApiPostsWatch,
  } = useAPIPosts(pageSize)

  // Stop api posts watch on db sync complete
  watch(isComplete, () => {
    if (isComplete.value) {
      stopApiPostsWatch()
    }
  })

  // dynamic posts
  const {
    content: paginatedDBPosts,
    canLoadMore,
    loadMore,
  } = paginateDBContent(dbPosts, pageSize)

  const posts = computed(() => {
    if (isComplete.value) {
      return paginatedDBPosts.value
    } else {
      return apiPosts.value
    }
  })

  const loading = computed(() =>
    isComplete.value ? false : loadingApiPosts.value
  )

  return { posts, loading, canLoadMore, loadMore }
}

export const useCurrentPageOrPost = (slug: Ref<string>) => {
  const dbContent = useCurrentDBPageOrPost(slug)
  const { isComplete } = useDBSyncComplete()
  const {
    content: apiContent,
    loading: loadingApiContent,
    stopWatch: stopApiContentWatch,
  } = useCurrentAPIPageOrPost(slug)

  // Stop api content watch on db sync complete
  watch(isComplete, () => {
    if (isComplete.value) {
      stopApiContentWatch()
    }
  })

  const content = computed(() =>
    isComplete.value ? dbContent.value : apiContent.value
  )
  const loading = computed(() =>
    isComplete.value ? false : loadingApiContent.value
  )

  return { content, loading }
}
