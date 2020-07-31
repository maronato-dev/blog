import dayjs from "dayjs"
import type { PostsOrPages, Tag, Author } from "@tryghost/content-api"
import { useGhostContentApi } from "../api"
import { useGhostDatabase } from "../db"
import { localizePostOrPage, localizeTag } from "../utils"
import { preparePostOrPageForDB } from "../db/transformers"
import type { WorkerRequest, WorkerResponse } from "./workerTypes"

const basePageSize = 30

async function loadTags(pageSize = basePageSize) {
  const api = useGhostContentApi()
  const db = useGhostDatabase()
  const makeRequest = async (page: number, limit = pageSize) => {
    return await api.tags.browse({
      limit,
      page,
    })
  }
  const initRequest = await makeRequest(1, 1)
  const total = initRequest.meta.pagination.total
  const pages = Array.from(
    new Array(Math.ceil(total / pageSize)),
    (_, i) => i + 1
  )
  const requests = pages.map(p => makeRequest(p, pageSize))
  return Promise.all(requests)
    .then(tagsArray =>
      tagsArray.reduce((agg: Tag[], tags) => [...agg, ...tags], [])
    )
    .then(async content => {
      return await db.tags.bulkPut(content.map(localizeTag)).then(() => {
        console.debug(`[GhostWorker] Updated ${content.length} tags`)
        return content.map(() => [1])
      })
    })
}

async function loadAuthors(pageSize = basePageSize) {
  const api = useGhostContentApi()
  const db = useGhostDatabase()
  const makeRequest = async (page: number, limit = pageSize) => {
    return await api.authors.browse({
      limit,
      page,
    })
  }
  const initRequest = await makeRequest(1, 1)
  const total = initRequest.meta.pagination.total
  const pages = Array.from(
    new Array(Math.ceil(total / pageSize)),
    (_, i) => i + 1
  )
  const requests = pages.map(p => makeRequest(p, pageSize))
  return Promise.all(requests)
    .then(authorsArray =>
      authorsArray.reduce((agg: Author[], authors) => [...agg, ...authors], [])
    )
    .then(async content => {
      return await db.authors.bulkPut(content).then(() => {
        console.debug(`[GhostWorker] Updated ${content.length} authors`)
        return content.map(() => [1])
      })
    })
}

async function savePostsOrPagesToDB(
  postsOrPages: PostsOrPages,
  type: "pages" | "posts" = "posts"
) {
  const db = useGhostDatabase()
  return db.posts
    .bulkPut(
      await Promise.all(
        postsOrPages.map(localizePostOrPage).map(preparePostOrPageForDB)
      ),
      {
        allKeys: true,
      }
    )
    .then(keys => {
      console.debug(`[GhostWorker] Updated ${keys.length} ${type}`)
      return keys
    })
    .catch(console.error)
}

async function loadPostOrPage(
  lastSync: Date,
  isPage = false,
  pageSize = basePageSize
) {
  const type = isPage ? "pages" : "posts"
  const api = useGhostContentApi()
  const formattedLastSync = dayjs(lastSync).format("YYYY-MM-DD HH:mm:ss")
  const initRequest = await api[type].browse({
    limit: 1,
    filter: `updated_at:>'${formattedLastSync}'`,
  })
  const total = initRequest.meta.pagination.total
  const pages = Array.from(
    new Array(Math.ceil(total / pageSize)),
    (_, i) => i + 1
  )
  const requests = pages.map(async page => {
    return await api[type]
      .browse({
        include: ["authors", "tags"],
        limit: pageSize,
        page,
        filter: `updated_at:>'${formattedLastSync}'`,
        order: "published_at desc",
      })
      .then(content => savePostsOrPagesToDB(content, type))
  })
  return Promise.all(requests)
}

async function loadPages(lastSync: Date, pageSize = basePageSize) {
  return loadPostOrPage(lastSync, true, pageSize)
}

async function loadPosts(lastSync: Date, pageSize = basePageSize) {
  return loadPostOrPage(lastSync, false, pageSize)
}

async function syncDatabase(lastSync: Date) {
  // Return automatically if offline
  if (!navigator.onLine) {
    const response: WorkerResponse = {
      action: "sync",
      status: "success",
    }
    return postMessage(response)
  }
  const results = await Promise.all([
    loadPosts(lastSync),
    loadPages(lastSync),
    loadTags(),
    loadAuthors(),
  ]).catch(e => {
    console.error(e)
    const response: WorkerResponse = {
      action: "sync",
      status: "error",
    }
    return postMessage(response)
  })

  const response: WorkerResponse = {
    action: "sync",
    status: "success",
  }
  postMessage(response)
  return results
}

onmessage = (event: MessageEvent) => {
  const request: WorkerRequest = event.data

  if (request.action === "sync") {
    console.debug("[GhostWorker] Syncing database...")
    const startTime = new Date()
    syncDatabase(request.data.lastSync).then(results => {
      const endTime = new Date().getTime() - startTime.getTime()
      const loadCount =
        results &&
        results.reduce(
          (sum, result) =>
            sum +
            (result as (Array<unknown> | void)[]).reduce(
              (s: number, r: Array<unknown> | void) => (r || []).length + s,
              0
            ),
          0
        )
      console.debug(
        `[GhostWorker] Done. Loaded ${loadCount} items in ${endTime} ms`
      )
    })
  }
}
