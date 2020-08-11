import { Ref, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { parseSlugLocale, LocalizedPublicTag } from "../utils"
import { useDBSyncComplete } from "../worker"
import { useError } from "../../../layout"
import { useDBReady } from "./reactive"
import { useGhostDatabase } from "."

export function useDBTags() {
  const db = useGhostDatabase()
  const dbReady = useDBReady()
  const tags = ref<LocalizedPublicTag[] | undefined>()
  const i18n = useI18n()

  const reloadTags = async () => {
    tags.value = undefined
    const loadedTags = (
      await db.tags
        .where({ language: i18n.locale.value })
        .reverse()
        .sortBy("name")
    ).filter((tag): tag is LocalizedPublicTag => tag.visibility === "public")

    tags.value = loadedTags
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  db.on("changes", reloadTags)
  watch(i18n.locale, reloadTags)

  watch(dbReady, value => value && reloadTags())
  if (dbReady.value) {
    reloadTags()
  }

  return tags
}

export function useCurrentDBTag(slug: Ref<string>) {
  const db = useGhostDatabase()
  const dbReady = useDBReady()
  const i18n = useI18n()
  const { isComplete } = useDBSyncComplete()
  const { trigger404 } = useError()

  const content = ref<LocalizedPublicTag | undefined | null>()

  const loadTag = async () => {
    if (!dbReady.value) {
      // Do nothing if DB is not ready
      return
    }

    const { nonLocalized, locale, hasLocale } = parseSlugLocale(slug.value)
    const language = hasLocale ? locale : i18n.locale.value
    const dbResult = (
      await db.tags.where({ slug: nonLocalized, language }).toArray()
    ).filter((tag): tag is LocalizedPublicTag => tag.visibility === "public")[0]

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
      content.value = dbResult
    }
  }

  // Update tag on locale or slug change
  watch([i18n.locale, slug], loadTag)
  // Update tag once sync is complete
  watch([isComplete], value => value && loadTag())

  // Fetch post when db is or becomes ready
  watch(dbReady, value => value && loadTag())
  if (dbReady.value) {
    // Initial fetch attempt
    loadTag()
  }

  return content
}
