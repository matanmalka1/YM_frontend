import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SetURLSearchParams } from 'react-router-dom'
import { parsePositiveInt } from '@/utils/utils'

interface SearchParamFilters {
  searchParams: URLSearchParams
  /** Get a string param; returns '' when absent. */
  getParam: (key: string) => string
  /** Get the global `page` param as a 1-based integer. Do not use for namespaced page params. */
  getPage: (defaultPage?: number) => number
  setFilter: (key: string, value: string, resetPage?: boolean) => void
  setFilters: (updates: Record<string, string>, resetPage?: boolean) => void
  setPage: (page: number) => void
  resetFilters: (defaults?: Record<string, string>) => void
  setSearchParams: SetURLSearchParams
}

/**
 * The URL a set of filter writes produces, as a value. Kept pure so a page's filter and
 * selection transitions can be verified without a router, and so every writer below goes
 * through one place rather than cloning and mutating params of its own.
 */
export const nextFilterParams = (current: URLSearchParams, updates: Record<string, string>, resetPage = true): URLSearchParams => {
  const next = new URLSearchParams(current)
  for (const [key, value] of Object.entries(updates)) {
    if (value) next.set(key, value)
    else next.delete(key)
  }
  if (resetPage) next.set('page', '1')
  return next
}

/** The URL a reset produces: nothing but the given defaults, back on page one. */
export const resetFilterParams = (defaults: Record<string, string> = {}): URLSearchParams => nextFilterParams(new URLSearchParams(), defaults)

export const useSearchParamFilters = (): SearchParamFilters => {
  const [searchParams, setSearchParams] = useSearchParams()

  const setStableSearchParams = useCallback<typeof setSearchParams>(
    (nextInit, navigateOptions) => {
      setSearchParams(nextInit, { preventScrollReset: true, ...navigateOptions })
    },
    [setSearchParams],
  )

  // All four writers are memoized on the current params: a page that normalizes its URL from an
  // effect needs them to be stable between renders, or the effect re-runs on every render.
  const setFilter = useCallback(
    (key: string, value: string, resetPage = true) => {
      setStableSearchParams(nextFilterParams(searchParams, { [key]: value }, resetPage))
    },
    [searchParams, setStableSearchParams],
  )

  const setFilters = useCallback(
    (updates: Record<string, string>, resetPage = true) => {
      setStableSearchParams(nextFilterParams(searchParams, updates, resetPage))
    },
    [searchParams, setStableSearchParams],
  )

  const setPage = useCallback(
    (page: number) => {
      setStableSearchParams(nextFilterParams(searchParams, { page: String(page) }, false))
    },
    [searchParams, setStableSearchParams],
  )

  const resetFilters = useCallback(
    (defaults: Record<string, string> = {}) => {
      setStableSearchParams(resetFilterParams(defaults))
    },
    [setStableSearchParams],
  )

  const getParam = useCallback((key: string): string => searchParams.get(key) ?? '', [searchParams])

  /** Reads the global `page` param only. Do not use for namespaced page params (e.g. audit trail). */
  const getPage = useCallback((defaultPage = 1): number => parsePositiveInt(searchParams.get('page'), defaultPage), [searchParams])

  return {
    searchParams,
    getParam,
    getPage,
    setFilter,
    setFilters,
    setPage,
    resetFilters,
    setSearchParams: setStableSearchParams,
  }
}
