import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { CHARGE_STATUS_OPTIONS, CHARGE_TYPE_OPTIONS_WITH_ALL, CHARGE_PERIOD_OPTIONS } from '../../constants'
import { clientsApi, clientsQK } from '@/features/clients'
import type { ChargesFilters } from '../../types'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

interface ChargesFiltersCardProps {
  filters: ChargesFilters
  onClear: () => void
  onFilterChange: (key: string, value: string) => void
}

const FIELDS = [
  { type: 'client-picker' as const, idKey: 'client_record_id', nameKey: 'client_name' },
  { type: 'select' as const, key: 'status', label: 'סטטוס', options: CHARGE_STATUS_OPTIONS },
  {
    type: 'select' as const,
    key: 'charge_type',
    label: 'סוג חיוב',
    options: CHARGE_TYPE_OPTIONS_WITH_ALL,
  },
  {
    type: 'select' as const,
    key: 'period',
    label: 'תקופה',
    options: CHARGE_PERIOD_OPTIONS,
  },
  {
    type: 'date-range' as const,
    fromKey: 'issued_after',
    toKey: 'issued_before',
    fromLabel: 'הונפק מתאריך',
    toLabel: 'הונפק עד תאריך',
  },
]

export const ChargesFiltersCard = ({ filters, onClear, onFilterChange }: ChargesFiltersCardProps) => {
  // The picked client's display name, paired with its id so a stale name can
  // never leak onto a different client (e.g. after a reset + deep-link).
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null)

  const urlClientId = filters.client_record_id ? Number(filters.client_record_id) : null
  const pickedMatchesFilter = picked != null && picked.id === filters.client_record_id

  // Resolve the name from the id when the filter arrived via URL (no name in params).
  const { data: urlClient } = useQuery({
    queryKey: clientsQK.detail(urlClientId ?? 0),
    queryFn: () => clientsApi.getById(urlClientId!),
    enabled: urlClientId != null && !pickedMatchesFilter,
    staleTime: QUERY_STALE_TIME.medium,
  })

  // Derived display name: empty without a client filter; otherwise the in-session
  // picked name, falling back to the name resolved from the URL id.
  const clientName = !filters.client_record_id
    ? ''
    : pickedMatchesFilter
      ? picked!.name
      : (urlClient?.full_name ?? '')

  return (
    <FilterPanel
      fields={FIELDS}
      values={{
        client_record_id: filters.client_record_id ?? '',
        client_name: clientName,
        status: filters.status ?? '',
        charge_type: filters.charge_type ?? '',
        period: filters.period ?? '',
        issued_after: filters.issued_after ?? '',
        issued_before: filters.issued_before ?? '',
      }}
      onChange={(key, value) => {
        // `client_name` is derived/local — never a real URL filter.
        if (key === 'client_name') return
        onFilterChange(key, value)
      }}
      onMultiChange={(updates) => {
        // The client-picker emits id + name together. Capture the name locally
        // (paired with its id) and forward only the real URL filters.
        if ('client_name' in updates) {
          const id = updates.client_record_id ?? ''
          setPicked(id ? { id, name: updates.client_name } : null)
        }
        for (const [key, value] of Object.entries(updates)) {
          if (key === 'client_name') continue
          onFilterChange(key, value)
        }
      }}
      onReset={onClear}
    />
  )
}

ChargesFiltersCard.displayName = 'ChargesFiltersCard'
