import { useCallback, useState } from 'react'

export const useChargeTableSelection = <TId extends string | number = number>() => {
  const [selectedIds, setSelectedIds] = useState<Set<TId>>(new Set())

  const toggleSelect = useCallback((id: TId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback((ids: TId[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      return allSelected ? new Set() : new Set(ids)
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set<TId>()), [])

  return {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  }
}
