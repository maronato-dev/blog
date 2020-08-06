import { Ref, computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { LocalizedPostOrPage, parseSlugLocale } from "../utils"
import { useDBSyncComplete } from "../worker"
import { useError } from "../../../layout"
import { useDBReady } from "./reactive"
import { hidratePostOrPageFromDB } from "./transformers"
import { useGhostDatabase } from "."

export function useDBPosts() {
  const db = useGhostDatabase()
  const dbReady = useDBReady()
  const posts = ref<LocalizedPostOrPage[] | undefined>()
  const i18n = useI18n()

  const reloadPosts = async () => {
    posts.value = undefined
    const loadedPosts = await db.posts
      .where({ language: i18n.locale.value })
      .and(post => !post.page)
      .reverse()
      .sortBy("publishedDate")
      .then(v => Promise.all(v.map(hidratePostOrPageFromDB)))

    if (loadedPosts.length === 0) {
      // If loaded 0 posts, thet may still be loading from API
      posts.value = undefined
    } else {
      posts.value = loadedPosts
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  db.on("changes", reloadPosts)
  watch(i18n.locale, reloadPosts)

  watch(dbReady, value => value && reloadPosts())
  if (dbReady.value) {
    reloadPosts()
  }

  return posts
}

export function useCurrentDBPageOrPost(slug: Ref<string>) {
  const db = useGhostDatabase()
  const dbReady = useDBReady()
  const i18n = useI18n()
  const { isComplete } = useDBSyncComplete()
  const { trigger404 } = useError()

  const content = ref<LocalizedPostOrPage | undefined | null>()

  const loadPost = async () => {
    if (!dbReady.value) {
      // Do nothing if DB is not ready
      return
    }

    const { nonLocalized, locale, hasLocale } = parseSlugLocale(slug.value)
    const language = hasLocale ? locale : i18n.locale.value
    const dbResult = (
      await db.posts.where({ slug: nonLocalized, language }).toArray()
    )[0]

    if (typeof dbResult === "undefined") {
      // Post was not found, set to null
      content.value = null
      // I don't really like to trigger this error here
      if (isComplete.value) {
        // If post was not found and sync has been completed, the post does not exist
        trigger404()
      }
    } else {
      // Post was found
      content.value = await hidratePostOrPageFromDB(dbResult)
    }
  }

  // Update post on locale or slug change
  watch([i18n.locale, slug], loadPost)
  // Update post once sync is complete
  watch([isComplete], value => value && loadPost())

  // Fetch post when db is or becomes ready
  watch(dbReady, value => value && loadPost())
  if (dbReady.value) {
    // Initial fetch attempt
    loadPost()
  }

  return content
}

export function useNextPost(post: Ref<LocalizedPostOrPage>) {
  const db = useGhostDatabase()
  const nextPost = ref<LocalizedPostOrPage | undefined>()

  async function loadNext() {
    nextPost.value = (
      await db.posts
        .where("publishedDate")
        .above(post.value.publishedDate)
        .and(p => p.id !== post.value.id && p.language === post.value.language)
        .and(p => !p.page)
        .toArray(arr => Promise.all(arr.map(hidratePostOrPageFromDB)))
    )[0]
  }

  watch(post, loadNext, { immediate: true })
  return nextPost
}

export function usePrevPost(post: Ref<LocalizedPostOrPage>) {
  const db = useGhostDatabase()
  const prevPost = ref<LocalizedPostOrPage | undefined>()

  async function loadPrev() {
    prevPost.value = (
      await db.posts
        .where("publishedDate")
        .below(post.value.publishedDate)
        .and(p => p.id !== post.value.id && p.language === post.value.language)
        .and(p => !p.page)
        .reverse()
        .toArray(arr => Promise.all(arr.map(hidratePostOrPageFromDB)))
    )[0]
  }

  watch(post, loadPrev, { immediate: true })
  return prevPost
}

export function paginateDBContent<T>(
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

export function usePostsWithTag(tagId: Ref<string | undefined>, pageSize = 15) {
  const db = useGhostDatabase()
  const i18n = useI18n()
  const posts = ref<LocalizedPostOrPage[]>([])

  async function loadPosts() {
    if (tagId.value) {
      posts.value = await db.posts
        .where({ language: i18n.locale.value, primary_tag: tagId.value })
        .toArray(arr => Promise.all(arr.map(hidratePostOrPageFromDB)))
    }
  }

  watch([i18n.locale, tagId], loadPosts, { immediate: true })

  const { content, canLoadMore, loadMore } = paginateDBContent(posts, pageSize)
  const total = computed(() => posts.value.length)

  return { posts: content, canLoadMore, loadMore, total }
}

export function useRelatedPosts(post: Ref<LocalizedPostOrPage>) {
  const next = useNextPost(post)
  const prev = usePrevPost(post)
  const primaryTagId = computed(() =>
    post.value.primary_tag ? post.value.primary_tag.id : undefined
  )
  const { posts: rawPostsWithTag, total } = usePostsWithTag(primaryTagId, 4)

  const withTags = computed(() =>
    rawPostsWithTag.value.filter(p => p.id !== post.value.id)
  )

  return { next, prev, withTags, withTagsTotal: total }
}
