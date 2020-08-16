import { Ref, computed, watch } from "vue"
import { SettingsResponse } from "@tryghost/content-api"
import { useSettings } from "./ghost/content/settings"
import { useMeta } from "./meta"
import { LocalizedPostOrPage, LocalizedPublicTag } from "./ghost/content/utils"
import { availableLocales, Locales } from "./locale/util"

const get = <
  T extends SettingsResponse | LocalizedPostOrPage | LocalizedPublicTag
>(
  obj: T | undefined,
  key: keyof T
): string | undefined => {
  if (!!obj && key in obj) {
    const value = obj[key]
    if (typeof value === "string") {
      return value
    }
  }
}

export const useSEOTags = (
  content?: Ref<LocalizedPostOrPage | LocalizedPublicTag | undefined>
) => {
  const { meta, link } = useMeta()
  const { settings } = useSettings()
  const cte = computed(() =>
    content && content.value && "title" in content.value
      ? content.value
      : undefined
  )
  const tag = computed(() =>
    content && content.value && "name" in content.value
      ? content.value
      : undefined
  )
  const sett = computed(() => (settings.value ? settings.value : undefined))
  watch([cte, sett, tag], () => {
    const metaValue = meta.value || []
    metaValue.push(
      ...[
        {
          name: "description",
          content:
            // Tag
            get(tag.value, "meta_description") ||
            get(tag.value, "description") ||
            // Post or page
            get(cte.value, "meta_description") ||
            get(cte.value, "custom_excerpt") ||
            get(cte.value, "excerpt") ||
            // Settings
            get(sett.value, "meta_description") ||
            get(sett.value, "description"),
        },
        {
          property: "og:site_name",
          content: get(sett.value, "meta_title") || get(sett.value, "title"),
        },
        {
          property: "og:type",
          content: cte.value ? "article" : "website",
        },
        {
          property: "og:title",
          content:
            // Tag
            get(tag.value, "og_title") ||
            get(tag.value, "meta_title") ||
            get(tag.value, "name") ||
            // Post or page
            get(cte.value, "og_title") ||
            get(cte.value, "meta_title") ||
            get(cte.value, "title") ||
            // Settings
            get(sett.value, "og_title") ||
            get(sett.value, "meta_title") ||
            get(sett.value, "title"),
        },
        {
          property: "og:description",
          content:
            // Tag
            get(tag.value, "og_description") ||
            get(tag.value, "meta_description") ||
            get(tag.value, "description") ||
            // Post or page
            get(cte.value, "og_description") ||
            get(cte.value, "meta_description") ||
            get(cte.value, "custom_excerpt") ||
            get(cte.value, "excerpt") ||
            // Settings
            get(sett.value, "og_description") ||
            get(sett.value, "meta_description") ||
            get(sett.value, "description"),
        },
        {
          property: "og:url",
          content:
            get(tag.value, "url") ||
            get(cte.value, "url") ||
            get(sett.value, "url"),
        },
        {
          property: "og:image",
          content:
            // Tag
            get(tag.value, "og_image") ||
            get(tag.value, "feature_image") ||
            // Post or page
            get(cte.value, "og_image") ||
            get(cte.value, "feature_image") ||
            // Settings
            get(sett.value, "og_image"),
        },
        {
          property: "article:published_time",
          content: get(cte.value, "published_at"),
        },
        {
          property: "article:modified_time",
          content: get(cte.value, "updated_at"),
        },
        {
          property: "article:tag",
          content:
            cte.value && cte.value.primary_tag
              ? cte.value.primary_tag.name
              : undefined,
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content:
            // Tag
            get(tag.value, "twitter_title") ||
            get(tag.value, "meta_title") ||
            get(tag.value, "name") ||
            // Post or page
            get(cte.value, "twitter_title") ||
            get(cte.value, "meta_title") ||
            get(cte.value, "title") ||
            // Settings
            get(sett.value, "twitter_title") ||
            get(sett.value, "meta_title") ||
            get(sett.value, "title"),
        },
        {
          name: "twitter:description",
          content:
            // Tag
            get(tag.value, "twitter_description") ||
            get(tag.value, "meta_description") ||
            get(tag.value, "description") ||
            // Post or page
            get(cte.value, "twitter_description") ||
            get(cte.value, "custom_excerpt") ||
            get(cte.value, "excerpt") ||
            // Settings
            get(sett.value, "twitter_description") ||
            get(sett.value, "description"),
        },
        {
          name: "twitter:url",
          content:
            get(tag.value, "url") ||
            get(cte.value, "url") ||
            get(sett.value, "url"),
        },
        {
          name: "twitter:image",
          content:
            // Tag
            get(tag.value, "twitter_image") ||
            get(tag.value, "feature_image") ||
            // Post or page
            get(cte.value, "twitter_image") ||
            get(cte.value, "feature_image") ||
            // Settings
            get(sett.value, "twitter_image"),
        },
      ]
    )
    meta.value = metaValue.filter(m => typeof m.content !== "undefined")
    const slug = content && content.value && content.value.slug
    const origin = window.location.origin
    const hreflang = availableLocales.map(locale => ({
      rel: "alternate",
      hreflang: locale,
      href: `${origin}/${tag.value ? "tag/" : ""}${locale}${
        slug ? `-${slug}` : ""
      }`,
      id: `hreflang-${locale}`,
    }))
    hreflang.push({
      rel: "alternate",
      hreflang: "x-default" as Locales,
      href: `${origin}${slug ? `/${slug}` : ""}`,
      id: "hreflang-default",
    })
    link.value = link.value ? [...link.value, ...hreflang] : hreflang
  })
}

export const useFavicon = () => {
  const { link } = useMeta()
  const { settings } = useSettings()
  const sett = computed(() => (settings.value ? settings.value : undefined))

  watch(
    sett,
    () => {
      const linkValue = link.value || []
      if (get(sett.value, "icon")) {
        linkValue.push({
          rel: "shortcut icon",
          type: "image/png",
          href: get(sett.value, "icon"),
          id: "favicon",
        })
      }
      link.value = linkValue
    },
    { immediate: true }
  )
}
