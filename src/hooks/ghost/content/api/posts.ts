import { ref, watch, Ref } from "vue"
import { useI18n } from "vue-i18n"
import { useGhostContentApi } from "."
import {
  LocalizedPostOrPage,
  localizePostOrPage,
  parseSlugLocale,
} from "../utils"
import { useRouter } from "vue-router"
import { useError } from "../../../layout"
import { useDBSyncComplete } from "../worker"

export function useAPIPosts(pageSize = 15) {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const posts = ref<LocalizedPostOrPage[]>([])
  const loading = ref(true)
  const { isComplete } = useDBSyncComplete()

  const reloadPosts = async () => {
    if (isComplete.value) {
      loading.value = false
      return
    }
    loading.value = true
    posts.value = await api.posts
      .browse({
        include: ["tags", "authors"],
        limit: pageSize,
        filter: `tag:hash-${i18n.locale.value}`,
      })
      .then(posts => posts.map(localizePostOrPage))
      .finally(() => {
        loading.value = false
      })
  }

  const stopWatch = watch(i18n.locale, reloadPosts, { immediate: true })

  return { posts, loading, stopWatch }
}

export const useCurrentAPIPageOrPost = (slug: Ref<string>) => {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const router = useRouter()
  const { trigger404 } = useError()
  const { isComplete } = useDBSyncComplete()

  const content = ref<LocalizedPostOrPage | undefined>()
  const loading = ref(true)

  const reloadPost = async () => {
    if (isComplete.value) {
      loading.value = false
      return
    }
    const { nonLocalized, locale, hasLocale } = parseSlugLocale(slug.value)
    const language = hasLocale ? locale : i18n.locale.value
    const localizedSlug = `${language}-${nonLocalized}`
    loading.value = true
    return api.posts
      .read({ slug: localizedSlug })
      .catch(() => {
        return api.pages.read({ slug: localizedSlug })
      })
      .then(postOrPage => {
        content.value = localizePostOrPage(postOrPage)
        // Change locale if post has locale defined
        if (hasLocale && locale !== i18n.locale.value) {
          i18n.locale.value = locale
          router.replace({
            name: "postOrPage",
            params: { slug: nonLocalized },
          })
        }
      })
      .catch(() => {
        trigger404()
      })
      .finally(() => {
        loading.value = false
      })
  }

  const stopWatch = watch([i18n.locale, slug], reloadPost, { immediate: true })

  return { content, loading, stopWatch }
}
