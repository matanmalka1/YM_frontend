export const TASKS_ENDPOINTS = {
  list: '/tasks',
  create: '/tasks',
  get: (id: number) => `/tasks/${id}`,
  update: (id: number) => `/tasks/${id}`,
  start: (id: number) => `/tasks/${id}/start`,
  complete: (id: number) => `/tasks/${id}/complete`,
  cancel: (id: number) => `/tasks/${id}/cancel`,
} as const
