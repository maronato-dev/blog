import { PostOrPage, Pagination } from "@tryghost/content-api"
import { Locales, availableLocales } from "../../locale/util"

export interface BrowseResults<T> extends Array<T> {
  meta: { pagination: Pagination }
}

export interface LocalizedPostOrPage extends PostOrPage {
  localizedSlug: string
  language: Locales
  primaryTagSlug?: string
  publishedDate?: Date
  updatedDate?: Date
}

export const getSlugLocale = (slug: string) => {
  return availableLocales.find(l => slug.startsWith(`${l}-`))
}

export const slugIsLocalized = (slug: string) => {
  return !!getSlugLocale(slug)
}

export const parseSlugLocale = (slug: string) => {
  const hasLocale = slugIsLocalized(slug)
  const locale = getSlugLocale(slug) || "en"

  const nonLocalized = hasLocale ? slug.substr(locale.length + 1) : slug
  const localized = `${locale}-${nonLocalized}`

  return { hasLocale, locale, nonLocalized, localized }
}

export const localizePostOrPage = (post: PostOrPage): LocalizedPostOrPage => {
  const { nonLocalized, localized, locale } = parseSlugLocale(post.slug)

  const primaryTagSlug = post.primary_tag ? post.primary_tag.slug : undefined
  const publishedDate = post.published_at
    ? new Date(post.published_at)
    : undefined
  const updatedDate = post.updated_at ? new Date(post.updated_at) : undefined

  return {
    ...post,
    language: locale,
    slug: nonLocalized,
    localizedSlug: localized,
    primaryTagSlug,
    publishedDate,
    updatedDate,
  }
}
