export const TASKS_ENDPOINTS = {
  list: '/tasks',
  create: '/tasks',
  get: (id: number) => `/tasks/${id}`,
  update: (id: number) => `/tasks/${id}`,
  delete: (id: number) => `/tasks/${id}`,
  complete: (id: number) => `/tasks/${id}/complete`,
  cancel: (id: number) => `/tasks/${id}/cancel`,
  bulkComplete: '/tasks/bulk-complete',
  bulkAssign: '/tasks/bulk-assign',
} as const
