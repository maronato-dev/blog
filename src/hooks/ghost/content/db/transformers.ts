import { Tag, Author } from "@tryghost/content-api"
import { LocalizedPostOrPage, localizeTag } from "../utils"
import { DBLocalizedPostOrPage, useGhostDatabase } from "./index"

const mapTagOAuthorToId = (tag?: Tag | Author | null) => (tag ? tag.id : "")
const asArray = <T>(val?: Array<T>) => (Array.isArray(val) ? val : [])

export const preparePostOrPageForDB = async (
  postOrPage: LocalizedPostOrPage
): Promise<DBLocalizedPostOrPage> => {
  const db = useGhostDatabase()

  // Put tags, updating them
  const internalOrLocalizedTags = asArray(postOrPage.tags).map(localizeTag)
  await db.tags.bulkPut(internalOrLocalizedTags)
  const tags = internalOrLocalizedTags.map(mapTagOAuthorToId)
  const primary_tag = postOrPage.primary_tag
    ? mapTagOAuthorToId(postOrPage.primary_tag)
    : undefined

  // Put authors, updating them
  await db.authors.bulkPut(asArray(postOrPage.authors))
  const authors = asArray(postOrPage.authors).map(mapTagOAuthorToId)
  const primary_author = postOrPage.primary_author
    ? mapTagOAuthorToId(postOrPage.primary_author)
    : undefined
  return { ...postOrPage, tags, primary_tag, authors, primary_author }
}

export const hidratePostOrPageFromDB = async (
  postOrPage: DBLocalizedPostOrPage
): Promise<LocalizedPostOrPage> => {
  const db = useGhostDatabase()

  const tags = await db.tags.bulkGet(postOrPage.tags)
  const primary_tag = postOrPage.primary_tag
    ? await db.tags.get(postOrPage.primary_tag)
    : undefined

  const authors = await db.authors.bulkGet(postOrPage.authors)
  const primary_author = postOrPage.primary_author
    ? await db.authors.get(postOrPage.primary_author)
    : undefined

  return { ...postOrPage, tags, primary_tag, authors, primary_author }
}
