export interface UsersFilters {
  page: number
  page_size: number
  is_active: string | undefined // "true" | "false" | undefined
  search?: string
}
