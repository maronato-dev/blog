import lunr from "lunr"
import {
  useGhostDatabase,
  DBLocalizedPostOrPage,
} from "../hooks/ghost/content/db"
import {
  LocalizedPublicTag,
  LocalizedPostOrPage,
} from "../hooks/ghost/content/utils"
import { Locales } from "../hooks/locale/util"
import { hidratePostOrPageFromDB } from "../hooks/ghost/content/db/transformers"
import { WorkerRequest, WorkerResponse } from "./workerTypes"

const debug = import.meta.env.DEV

type SearchRef = string
type Type = "post" | "page" | "tag"
type Table = "posts" | "tags"
type ID = string
type DBTypes = DBLocalizedPostOrPage | LocalizedPublicTag

interface SearchDocument {
  searchRef: SearchRef
  type: Type
  table: Table
  id: ID
  title: string
  body: string
  language: Locales
}

interface FoundPostOrPage {
  table: "posts"
  doc: LocalizedPostOrPage
}

interface FoundTag {
  table: "tags"
  doc: LocalizedPublicTag
}

type DocumentResultData = FoundPostOrPage | FoundTag

export interface DocumentResult {
  score: number
  data: DocumentResultData
}

const objFactory = <T>(cb: () => T) => {
  const obj = cb()
  return () => obj
}

const useSearchIndex = objFactory(() => {
  const index = { value: {} as lunr.Index }
  return index
})

const useDocumentsLoaded = objFactory(() => {
  const loaded = { value: false }
  const setLoaded = () => {
    loaded.value = true
  }
  return { loaded, setLoaded }
})

const searchRefSeparator = "//"

const getTable = (element: DBTypes): Table =>
  "page" in element ? "posts" : "tags"

const parseSearchRef = (searchRef: string): [ID, Table] => {
  const fields = searchRef.split(searchRefSeparator)
  return [fields[0], fields[1]] as [ID, Table]
}

const makeSearchRef = (element: DBTypes): SearchRef => {
  const table = getTable(element)
  const id: ID = element.id
  return `${id}${searchRefSeparator}${table}`
}

function transformIntoSearchDocument(dbElement?: DBTypes): SearchDocument
function transformIntoSearchDocument(dbElement: undefined): undefined
function transformIntoSearchDocument(
  dbElement?: DBTypes
): SearchDocument | undefined {
  if (typeof dbElement === "undefined") {
    return
  }
  let document: SearchDocument
  // if post or page
  if (!("page" in dbElement)) {
    document = {
      table: getTable(dbElement),
      searchRef: makeSearchRef(dbElement),
      type: "tag",
      id: dbElement.id,
      title: dbElement.name || "",
      body: "",
      language: dbElement.language,
    }
  } else {
    document = {
      table: getTable(dbElement),
      searchRef: makeSearchRef(dbElement),
      type: dbElement.page ? "page" : "post",
      id: dbElement.id,
      title: dbElement.title || "",
      body: dbElement.custom_excerpt || dbElement.excerpt || "",
      language: dbElement.language,
    }
  }
  return document
}

const getDBElementFromSearchRef = async (ref: SearchRef) => {
  const db = useGhostDatabase()
  const [id, table] = parseSearchRef(ref)
  if (table === "posts") {
    return db.posts.get(id)
  } else {
    const result = await db.tags.get(id)
    if (result && result.visibility === "public") {
      return result
    }
  }
}

const getDocumentResultDataFromDBElement = async (
  el: DBTypes
): Promise<DocumentResultData> => {
  if ("page" in el) {
    const table: Table = "posts"
    return { table, doc: await hidratePostOrPageFromDB(el) }
  } else {
    const table: Table = "tags"
    return { table, doc: el }
  }
}

const getDocumentResultDataFromRef = async (
  ref: SearchRef
): Promise<DocumentResultData | undefined> => {
  return getDBElementFromSearchRef(ref).then(el => {
    if (el) {
      return getDocumentResultDataFromDBElement(el)
    }
  })
}

const loadDocuments = async () => {
  const db = useGhostDatabase()
  const index = useSearchIndex()
  const { setLoaded } = useDocumentsLoaded()

  const documents: SearchDocument[] = []
  debug && console.debug("[SearchWorker] Loading posts...")
  await db.posts.each(postOrPage => {
    documents.push(transformIntoSearchDocument(postOrPage))
  })
  debug && console.debug("[SearchWorker] Loading tags...")
  await db.tags.where({ visibility: "public" }).each(tag => {
    if (tag.visibility === "public") {
      documents.push(transformIntoSearchDocument(tag))
    }
  })

  debug && console.debug("[SearchWorker] Indexing documents...")
  index.value = lunr(function () {
    this.ref("searchRef")
    this.field("id", { boost: 10 })
    this.field("title", { boost: 2 })
    this.field("body")
    this.field("type", { boost: 5 })
    this.field("language", { boost: 10 })
    documents.forEach(doc => {
      this.add(doc, { boost: doc.type === "tag" ? 3 : 1 })
    })
  })

  setLoaded()
}

const buildDocumentResult = async (
  searchResult: lunr.Index.Result
): Promise<DocumentResult | undefined> => {
  const data = await getDocumentResultDataFromRef(searchResult.ref)
  if (data) {
    return {
      score: searchResult.score,
      data,
    }
  }
}

const search = async (query: string) => {
  const index = useSearchIndex()
  const { loaded } = useDocumentsLoaded()

  if (!loaded.value) {
    debug && console.debug("[SearchWorker] Indexing first search")
    await loadDocuments()
  }

  const results = await Promise.all(
    index.value.search(query).map(buildDocumentResult)
  ).then(r => r.filter((v): v is DocumentResult => !!v))
  const response: WorkerResponse = {
    action: "search",
    status: "success",
    results,
  }
  postMessage(response)
  return results
}

onmessage = (event: MessageEvent) => {
  const request: WorkerRequest = event.data

  if (request.action === "search") {
    debug &&
      console.debug(
        `[SearchWorker] Searching with query '${request.data.query}'`
      )
    const startTime = new Date()
    search(request.data.query).then(results => {
      const endTime = new Date().getTime() - startTime.getTime()
      debug &&
        console.debug(
          `[SearchWorker] Done! Found ${results.length} items in ${endTime} ms`
        )
    })
  }
}
