import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { CHARGE_STATUS_OPTIONS, CHARGE_TYPE_OPTIONS_WITH_ALL, CHARGE_PERIOD_OPTIONS } from '../constants'
import { clientsApi, clientsQK } from '@/features/clients'
import type { ChargesFilters } from '../types'
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
  const [clientName, setClientName] = useState('')

  // Resolve client name when filter arrives via URL (no name in URL params)
  const urlClientId = filters.client_record_id ? Number(filters.client_record_id) : null
  const { data: urlClient } = useQuery({
    queryKey: clientsQK.detail(urlClientId ?? 0),
    queryFn: () => clientsApi.getById(urlClientId!),
    enabled: urlClientId != null && !clientName,
    staleTime: QUERY_STALE_TIME.medium,
  })

  useEffect(() => {
    if (urlClient) setClientName(urlClient.full_name)
  }, [urlClient])

  useEffect(() => {
    if (!filters.client_record_id) setClientName('')
  }, [filters.client_record_id])

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
        if (key === 'client_name') {
          setClientName(value)
          return
        }
        onFilterChange(key, value)
      }}
      onReset={onClear}
    />
  )
}

ChargesFiltersCard.displayName = 'ChargesFiltersCard'
