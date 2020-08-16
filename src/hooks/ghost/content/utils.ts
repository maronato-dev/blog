import {
  PostOrPage,
  Pagination,
  Tag,
  SocialMedia,
  CodeInjection,
  Nullable,
} from "@tryghost/content-api"
import { Locales, availableLocales } from "../../locale/util"

export interface ExtraInfoTag extends Tag, SocialMedia, CodeInjection {
  accent_color?: Nullable<string>
  canonical_url?: Nullable<string>
}

export interface BrowseResults<T> extends Array<T> {
  meta: { pagination: Pagination }
}

interface LocalizedEntry {
  localizedSlug: string
  language: Locales
}

export interface LocalizedPostOrPage extends LocalizedEntry, PostOrPage {
  publishedDate?: Date
  updatedDate?: Date
  page: boolean
}

export interface PublicTag extends Omit<ExtraInfoTag, "visibility"> {
  visibility: "public"
}

export interface InternalTag extends Omit<ExtraInfoTag, "visibility"> {
  visibility: "internal"
}

export type InternalOrPublicTag = InternalTag | PublicTag

export interface LocalizedPublicTag extends LocalizedEntry, PublicTag {}
export type InternalOrLocalizedPublicTag = InternalTag | LocalizedPublicTag

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

  const publishedDate = post.published_at
    ? new Date(post.published_at)
    : undefined
  const updatedDate = post.updated_at ? new Date(post.updated_at) : undefined

  return {
    ...post,
    page: !!post.page,
    language: locale,
    slug: nonLocalized,
    localizedSlug: localized,
    publishedDate,
    updatedDate,
  }
}

export const localizeTag = (
  tag: ExtraInfoTag
): InternalOrLocalizedPublicTag => {
  if (tag.visibility === "internal") {
    return tag as InternalTag
  }
  const { nonLocalized, localized, locale } = parseSlugLocale(tag.slug)

  return {
    ...tag,
    visibility: "public",
    language: locale,
    slug: nonLocalized,
    localizedSlug: localized,
  }
}
