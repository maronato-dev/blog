import { Ref, computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { usePaginateDBContent } from "./db/utils"
import { useCurrentAPITag } from "./api/tags"

import { parseSlugLocale } from "./utils"
import { useDBTags, useCurrentDBTag } from "./db/tags"

export function useTags(pageSize = 15) {
  const dbTags = useDBTags()

  // dynamic posts
  const { content: tags, canLoadMore, loadMore } = usePaginateDBContent(
    dbTags,
    pageSize
  )

  const loading = computed(() => {
    return typeof dbTags.value === "undefined"
  })

  return { tags, loading, canLoadMore, loadMore }
}

export const useCurrentTag = (slug: Ref<string>) => {
  const dbTag = useCurrentDBTag(slug)
  const {
    tag: apiTag,
    loading: loadingApiTag,
    loadTag: loadAPITag,
  } = useCurrentAPITag(slug)

  // Load API tag only if post was not found on the database
  watch(dbTag, value => value === null && loadAPITag())

  const loading = computed(() => {
    // If dbTag is undefined, is loading from db
    if (typeof dbTag.value === "undefined") {
      return true
    }
    // If was not found on db, is loading from API
    if (dbTag.value === null) {
      return loadingApiTag.value
    }
    // Else, not loading
    return false
  })

  const tag = computed(() =>
    loading.value ? undefined : dbTag.value || apiTag.value
  )

  // Update locale if post has a different locale than the current one
  const i18n = useI18n()
  const router = useRouter()
  const route = useRoute()
  watch(tag, () => {
    if (tag.value) {
      const { hasLocale, locale, nonLocalized } = parseSlugLocale(slug.value)
      if (hasLocale) {
        if (locale !== i18n.locale.value) {
          i18n.locale.value = locale
        }
        router.replace({
          name: "tag",
          params: { slug: nonLocalized },
          hash: route.hash,
        })
      }
    }
  })

  return { tag, loading }
}
