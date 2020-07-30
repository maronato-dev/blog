import { Ref, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import {
  LocalizedPostOrPage,
  localizePostOrPage,
  parseSlugLocale,
} from "../utils"
import { useError } from "../../../layout"
import { useDBSyncComplete } from "../worker"
import { useGhostContentApi } from "."

export const useCurrentAPIPageOrPost = (slug: Ref<string>) => {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const { trigger404 } = useError()
  const { isComplete } = useDBSyncComplete()

  const content = ref<LocalizedPostOrPage | undefined>()
  const loading = ref(true)

  const loadPost = async () => {
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
      })
      .catch(() => {
        trigger404()
      })
      .finally(() => {
        loading.value = false
      })
  }

  const stopWatch = watch([i18n.locale, slug], loadPost)
  watch(isComplete, value => value && stopWatch())

  return { content, loading, loadPost }
}
