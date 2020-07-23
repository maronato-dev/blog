import { ref, watch, Ref, computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useGhostDatabase } from "."
import { LocalizedPostOrPage, parseSlugLocale } from "../utils"
import { useDBSyncComplete } from "../worker"
import { useError } from "../../../layout"

export function useDBPosts() {
  const db = useGhostDatabase()
  const posts = ref<LocalizedPostOrPage[]>([])
  const i18n = useI18n()

  const reloadPosts = async () => {
    posts.value = await db.posts
      .where({ language: i18n.locale.value })
      .and(post => !post.page)
      .reverse()
      .sortBy("publishedDate")
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  db.on("changes", reloadPosts)
  db.on("ready", reloadPosts)
  watch(i18n.locale, reloadPosts, { immediate: true })

  return posts
}

export function useCurrentDBPageOrPost(slug: Ref<string>) {
  const db = useGhostDatabase()
  const i18n = useI18n()
  const router = useRouter()
  const { isComplete } = useDBSyncComplete()
  const { trigger404 } = useError()

  const content = ref<LocalizedPostOrPage | undefined>()

  watch(
    [isComplete, i18n.locale, slug],
    async () => {
      const { nonLocalized, locale, hasLocale } = parseSlugLocale(slug.value)
      if (isComplete.value) {
        const language = hasLocale ? locale : i18n.locale.value
        content.value = (
          await db.posts.where({ slug: nonLocalized, language }).toArray()
        )[0]

        if (!content.value) {
          trigger404()
        }
        // Change locale if post has locale defined
        if (hasLocale && locale !== i18n.locale.value) {
          i18n.locale.value = locale
          router.replace({
            name: "postOrPage",
            params: { slug: nonLocalized },
          })
        }
      }
    },
    { immediate: true }
  )

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
        .toArray()
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
        .reverse()
        .toArray()
    )[0]
  }

  watch(post, loadPrev, { immediate: true })
  return prevPost
}

export function paginateDBContent<T>(content: Ref<T[]>, pageSize = 15) {
  const page = ref(1)
  const pages = computed(() => Math.ceil(content.value.length / pageSize))
  const paginatedContent = computed(() =>
    content.value.slice(0, pageSize * page.value)
  )
  const loadMore = () => {
    page.value += 1
  }
  const canLoadMore = computed(() => page.value < pages.value)

  return { content: paginatedContent, loadMore, canLoadMore }
}

export function usePostsWithTag(
  tagSlug: Ref<string | undefined>,
  pageSize = 15
) {
  const db = useGhostDatabase()
  const i18n = useI18n()
  const posts = ref<LocalizedPostOrPage[]>([])

  async function loadPosts() {
    if (tagSlug?.value) {
      posts.value = await db.posts
        .where({ language: i18n.locale.value, primaryTagSlug: tagSlug.value })
        .toArray()
    }
  }

  watch([i18n.locale, tagSlug], loadPosts, { immediate: true })

  const { content, canLoadMore, loadMore } = paginateDBContent(posts, pageSize)
  const total = computed(() => posts.value.length)

  return { posts: content, canLoadMore, loadMore, total }
}

export function useRelatedPosts(post: Ref<LocalizedPostOrPage>) {
  const next = useNextPost(post)
  const prev = usePrevPost(post)
  const primaryTagSlug = computed(() => post.value.primaryTagSlug)
  const { posts: rawPostsWithTag, total } = usePostsWithTag(primaryTagSlug, 4)

  const withTags = computed(() =>
    rawPostsWithTag.value.filter(p => p.id !== post.value.id)
  )

  return { next, prev, withTags, withTagsTotal: total }
}
