type Actions = "sync"
type Status = "success" | "error"

export interface WorkerResponse {
  action: Actions
  status: Status
}

export interface WorkerSyncRequest {
  action: "sync"
  data: {
    lastSync: Date
  }
}

export type WorkerRequest = WorkerSyncRequest
