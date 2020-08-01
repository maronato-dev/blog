import type { DocumentResult } from "./search"

type Actions = "sync" | "search"
type Status = "success" | "error"

/**
 * Responses
 */

interface BaseWorkerResponse {
  action: Actions
  status: Status
}

interface WorkerSyncResponse extends BaseWorkerResponse {
  action: "sync"
}

interface WorkerSearchSuccessResponse extends BaseWorkerResponse {
  action: "search"
  status: "success"
  results: DocumentResult[]
}

interface WorkerSearchErrorResponse extends BaseWorkerResponse {
  action: "search"
  status: "error"
}

type WorkerSearchResponse =
  | WorkerSearchSuccessResponse
  | WorkerSearchErrorResponse

export type WorkerResponse = WorkerSyncResponse | WorkerSearchResponse

/**
 * Requests
 */

interface BaseWorkerRequest {
  action: Actions
  data?: Record<string, unknown>
}

interface WorkerSyncRequest extends BaseWorkerRequest {
  action: "sync"
  data: {
    lastSync: Date
  }
}

interface WorkerSearchRequest extends BaseWorkerRequest {
  action: "search"
  data: {
    query: string
  }
}

export type WorkerRequest = WorkerSyncRequest | WorkerSearchRequest
