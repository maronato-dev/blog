import { Ref, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { parseSlugLocale, LocalizedPublicTag, localizeTag } from "../utils"
import { useError } from "../../../layout"
import { useDBSyncComplete } from "../worker"
import { useGhostContentApi } from "."

export const useCurrentAPITag = (slug: Ref<string>) => {
  const api = useGhostContentApi()
  const i18n = useI18n()
  const { trigger404 } = useError()
  const { isComplete } = useDBSyncComplete()

  const tag = ref<LocalizedPublicTag | undefined>()
  const loading = ref(true)

  const loadTag = async () => {
    if (isComplete.value) {
      loading.value = false
      return
    }
    const { nonLocalized, locale, hasLocale } = parseSlugLocale(slug.value)
    const language = hasLocale ? locale : i18n.locale.value
    const localizedSlug = `${language}-${nonLocalized}`
    loading.value = true
    return api.tags
      .read({ slug: localizedSlug })
      .then(apiTag => {
        const internalOrPublicTag = localizeTag(apiTag)
        if (internalOrPublicTag.visibility === "public") {
          tag.value = internalOrPublicTag
        } else {
          return Promise.reject()
        }
      })
      .catch(() => {
        trigger404()
      })
      .finally(() => {
        loading.value = false
      })
  }

  const stopWatch = watch([i18n.locale, slug], loadTag)
  watch(isComplete, value => value && stopWatch())

  return { tag, loading, loadTag }
}
