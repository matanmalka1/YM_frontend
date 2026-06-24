import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '@/features/clients'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import { CHARGE_STATUS_OPTIONS, CHARGE_TYPE_OPTIONS_WITH_ALL, CHARGE_PERIOD_OPTIONS } from '../constants'
import type { ChargesFilters } from '../types'
import { CHARGES_MESSAGES } from '../messages'

const FIELDS: FilterFieldDef[] = [
  { type: 'client-picker', idKey: 'client_record_id', nameKey: 'client_name' },
  { type: 'select', key: 'status', label: CHARGES_MESSAGES.filters.status, options: CHARGE_STATUS_OPTIONS },
  { type: 'select', key: 'charge_type', label: CHARGES_MESSAGES.filters.type, options: CHARGE_TYPE_OPTIONS_WITH_ALL },
  { type: 'select', key: 'period', label: CHARGES_MESSAGES.filters.period, options: CHARGE_PERIOD_OPTIONS },
  {
    type: 'date-range',
    fromKey: 'issued_after',
    toKey: 'issued_before',
    fromLabel: CHARGES_MESSAGES.filters.issuedFrom,
    toLabel: CHARGES_MESSAGES.filters.issuedTo,
  },
]

interface UseChargesFiltersArgs {
  filters: ChargesFilters
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

/**
 * Builds the charges FilterPanel slot. Owns the client-picker name resolution:
 * the picked name is paired with its id so a stale name can never leak onto a
 * different client (e.g. after a reset + deep-link), and the name is resolved
 * from the URL id when the filter arrived via a deep link (no name in params).
 */
export const useChargesFilters = ({ filters, onFilterChange, onReset }: UseChargesFiltersArgs) => {
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null)

  const urlClientId = filters.client_record_id ? Number(filters.client_record_id) : null
  const pickedMatchesFilter = picked != null && picked.id === filters.client_record_id

  const { data: urlClient } = useQuery({
    queryKey: clientsQK.detail(urlClientId ?? 0),
    queryFn: () => clientsApi.getById(urlClientId!),
    enabled: urlClientId != null && !pickedMatchesFilter,
    staleTime: QUERY_STALE_TIME.medium,
  })

  const clientName = !filters.client_record_id ? '' : pickedMatchesFilter ? picked!.name : (urlClient?.full_name ?? '')

  return {
    fields: FIELDS,
    values: {
      client_record_id: filters.client_record_id ?? '',
      client_name: clientName,
      status: filters.status ?? '',
      charge_type: filters.charge_type ?? '',
      period: filters.period ?? '',
      issued_after: filters.issued_after ?? '',
      issued_before: filters.issued_before ?? '',
    },
    onChange: (key: string, value: string) => {
      // `client_name` is derived/local — never a real URL filter.
      if (key === 'client_name') return
      onFilterChange(key, value)
    },
    onMultiChange: (updates: Record<string, string>) => {
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
    },
    onReset,
  }
}
