import Dexie from "dexie"
import "dexie-observable"
import { LocalizedPostOrPage } from "../utils"

class GhostDatabase extends Dexie {
  public posts: Dexie.Table<LocalizedPostOrPage, string>

  public constructor() {
    super("GhostDatabase")
    this.version(1).stores({
      posts:
        "id,uuid,slug,page,primaryTagSlug,publishedDate,updatedDate,language",
    })
    this.posts = this.table("posts")
  }
}

export const useGhostDatabase = (() => {
  const db = new GhostDatabase()
  return () => db
})()

const serializeKey = (_key: keyof LocalizedPostOrPage, value: unknown) => {
  if (typeof value === "undefined") {
    return undefined
  }
  return JSON.parse(JSON.stringify(value))
}

export const preparePostForDB = (post: LocalizedPostOrPage) => {
  const toParse: Partial<LocalizedPostOrPage> = Object.entries(post)
    .filter(([_key, value]) => !(value instanceof Date))
    .reduce(
      (agg, [key, value]) => ({
        ...agg,
        [key]: serializeKey(key as keyof LocalizedPostOrPage, value),
      }),
      { page: false }
    )
  Object.assign(post, toParse)
  return post
}
