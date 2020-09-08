import Dexie from "dexie"
import "dexie-observable"
import { Author } from "@tryghost/content-api"
import { LocalizedPostOrPage, InternalOrLocalizedPublicTag } from "../utils"

export const DBVersion = 2.1

export interface DBLocalizedPostOrPage
  extends Omit<
    LocalizedPostOrPage,
    "tags" | "primary_tag" | "authors" | "primary_author"
  > {
  tags: string[]
  primary_tag?: string
  authors: string[]
  primary_author?: string
}

class GhostDatabase extends Dexie {
  public posts: Dexie.Table<DBLocalizedPostOrPage, string>
  public tags: Dexie.Table<InternalOrLocalizedPublicTag, string>
  public authors: Dexie.Table<Author, string>

  public constructor() {
    super("GhostDatabase")
    this.version(DBVersion).stores({
      posts: "id,uuid,page,publishedDate,updatedDate,language,[slug+language]",
      tags: "id,slug,visibility,language,[slug+language]",
      authors: "id,slug",
    })
    this.posts = this.table("posts")
    this.tags = this.table("tags")
    this.authors = this.table("authors")
  }
}

export const useGhostDatabase = (() => {
  const db = new GhostDatabase()
  db.open()
  return () => db
})()
