import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SetURLSearchParams } from 'react-router-dom'

interface SearchParamFilters {
  searchParams: URLSearchParams
  setFilter: (key: string, value: string, resetPage?: boolean) => void
  setFilters: (updates: Record<string, string>, resetPage?: boolean) => void
  setPage: (page: number) => void
  resetFilters: (defaults?: Record<string, string>) => void
  setSearchParams: SetURLSearchParams
}

export const useSearchParamFilters = (): SearchParamFilters => {
  const [searchParams, setSearchParams] = useSearchParams()

  const setStableSearchParams = useCallback<typeof setSearchParams>(
    (nextInit, navigateOptions) => {
      setSearchParams(nextInit, { preventScrollReset: true, ...navigateOptions })
    },
    [setSearchParams],
  )

  const setFilter = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (resetPage) next.set('page', '1')
    setStableSearchParams(next)
  }

  const setFilters = (updates: Record<string, string>, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    if (resetPage) next.set('page', '1')
    setStableSearchParams(next)
  }

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setStableSearchParams(next)
  }

  const resetFilters = (defaults: Record<string, string> = {}) => {
    const next = new URLSearchParams()
    for (const [k, v] of Object.entries(defaults)) {
      if (v) next.set(k, v)
    }
    next.set('page', '1')
    setStableSearchParams(next)
  }

  return { searchParams, setFilter, setFilters, setPage, resetFilters, setSearchParams: setStableSearchParams }
}
