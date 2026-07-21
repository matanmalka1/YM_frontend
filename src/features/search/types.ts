/** The page's filter state, already parsed out of the URL: the term and the clients-list page. */
export interface SearchFilters {
  search: string
  page: number
  page_size: number
}

/**
 * Paging state for one of the page's two lists — the client matches, or the expanded match
 * group. Only one of them is paginated at a time, so both drive the same `page` param.
 */
export interface SearchPagination {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}
