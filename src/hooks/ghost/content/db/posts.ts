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

export function useNextPost(post: LocalizedPostOrPage) {
  const db = useGhostDatabase()
  const nextPost = ref<LocalizedPostOrPage | undefined>()

  async function loadNext() {
    nextPost.value = (
      await db.posts
        .where("publishedDate")
        .above(post.publishedDate)
        .and(p => p.id !== post.id && p.language === post.language)
        .toArray()
    )[0]
  }

  loadNext()
  return nextPost
}

export function usePrevPost(post: LocalizedPostOrPage) {
  const db = useGhostDatabase()
  const prevPost = ref<LocalizedPostOrPage | undefined>()

  async function loadPrev() {
    prevPost.value = (
      await db.posts
        .where("publishedDate")
        .below(post.publishedDate)
        .and(p => p.id !== post.id && p.language === post.language)
        .reverse()
        .toArray()
    )[0]
  }

  loadPrev()
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

export function usePostsWithTag(tagSlug?: string, pageSize = 15) {
  const db = useGhostDatabase()
  const i18n = useI18n()
  const posts = ref<LocalizedPostOrPage[]>([])

  async function loadPosts() {
    if (tagSlug) {
      posts.value = await db.posts
        .where({ language: i18n.locale.value, primaryTagSlug: tagSlug })
        .toArray()
    }
  }

  watch(i18n.locale, loadPosts, { immediate: true })

  const { content, canLoadMore, loadMore } = paginateDBContent(posts, pageSize)

  return { posts: content, canLoadMore, loadMore, total: posts.value.length }
}

export function useRelatedPosts(post: LocalizedPostOrPage) {
  const next = useNextPost(post)
  const prev = usePrevPost(post)
  const { posts: rawPostsWithTag, total } = usePostsWithTag(
    post.primaryTagSlug,
    4
  )

  const withTags = computed(() =>
    rawPostsWithTag.value.filter(p => p.id !== post.id)
  )

  return { next, prev, withTags, withTagsTotal: total }
}
