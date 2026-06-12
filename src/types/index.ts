/** ISO-8601 calendar date string `YYYY-MM-DD`. */
export type ISODateString = `${number}${number}${number}${number}-${number}${number}-${number}${number}`

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

// Pagination params for API requests (snake_case to match backend)
interface PagedQueryParams {
  page: number
  page_size: number
}

export type PagedFilters<T extends Record<string, unknown> = Record<string, unknown>> = PagedQueryParams & T

export type UserRole = 'advisor' | 'secretary'

export interface AuthUser {
  id: number
  full_name: string
  role: UserRole
  email: string
}
