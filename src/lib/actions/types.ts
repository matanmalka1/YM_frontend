// INFRASTRUCTURE LAYER: Availability metadata describing which actions a
// resource currently exposes. Consumed only as availability flags — code reads
// `action.key` presence and nothing else. It is NOT an executable command: the
// frontend never reads endpoint/method/payload from a descriptor. Execution
// lives in per-domain typed API clients/hooks. The backend payload carries more
// fields (label, endpoint, method, confirm, ...); the frontend deliberately
// ignores them, so this type intentionally exposes only `key`.
export interface BackendAction {
  key: string
}
