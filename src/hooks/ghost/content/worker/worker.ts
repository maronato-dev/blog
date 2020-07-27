import dayjs from "dayjs"
import { useGhostContentApi } from "../api"
import { useGhostDatabase, preparePostForDB } from "../db"
import { localizePostOrPage, LocalizedPostOrPage } from "../utils"
import type { WorkerRequest, WorkerResponse } from "./workerTypes"

const basePageSize = 20

const fixPageProperty = (type: "pages" | "posts") => (
  content: LocalizedPostOrPage
): LocalizedPostOrPage => ({ ...content, page: type === "pages" })

async function loadPostOrPage(
  lastSync: Date,
  isPage = false,
  pageSize = basePageSize
) {
  const type = isPage ? "pages" : "posts"
  const api = useGhostContentApi()
  const db = useGhostDatabase()
  const formattedLastSync = dayjs(lastSync).format("YYYY-MM-DD HH:mm:ss")
  const initRequest = await api[type].browse({
    limit: 1,
  })
  const total = initRequest.meta.pagination.total
  const pages = Array.from(
    new Array(Math.ceil(total / pageSize)),
    (_, i) => i + 1
  )
  const requests = pages.map(async page => {
    const posts = await api[type].browse({
      include: ["authors", "tags"],
      limit: pageSize,
      page,
      filter: `updated_at:>'${formattedLastSync}'`,
    })
    return db.posts.bulkPut(
      posts
        .map(localizePostOrPage)
        .map(preparePostForDB)
        .map(fixPageProperty(type)),
      { allKeys: true }
    )
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
    console.debug("[GhostWorker] Syncing database")
    syncDatabase(request.data.lastSync).then(results =>
      console.debug(
        "[GhostWorker] Done. Posts/Pages loaded:",
        results &&
          results.reduce(
            (sum, result) => sum + result.reduce((s, r) => r.length + s, 0),
            0
          )
      )
    )
  }
}
