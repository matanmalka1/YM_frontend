import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { createClientPickerFilter } from '@/features/clients/public'
import { ALL_YEARS_URL_OPTION } from '@/constants/filterOptions.constants'
import { getOperationalTaxYear, getOperationalYearOptions } from '@/constants/periodOptions.constants'
import type { VatWorkItemStatus } from '../api'
import {
  VAT_PERIOD_TYPE_SELECT_OPTIONS,
  VAT_WORK_ITEMS_STATUS_OPTIONS,
  VAT_WORK_ITEM_STATUS_VALUES,
} from '../constants/vatConstants'
import type { VatWorkItemsFilters } from '../types'
import { toVatPeriodTypeFilter } from '../utils/filters'

const isVatWorkItemStatus = (value: string): value is VatWorkItemStatus =>
  VAT_WORK_ITEM_STATUS_VALUES.some((status) => status === value)

const buildFilterFields = () => [
  createClientPickerFilter({ idKey: 'client_record_id', nameKey: 'client_name' }),
  {
    type: 'select' as const,
    key: 'year',
    label: 'שנה',
    options: [ALL_YEARS_URL_OPTION, ...getOperationalYearOptions()],
    defaultValue: String(getOperationalTaxYear()),
  },
  { type: 'select' as const, key: 'status', label: 'סטטוס', options: VAT_WORK_ITEMS_STATUS_OPTIONS },
  { type: 'select' as const, key: 'period_type', label: 'סוג דיווח', options: VAT_PERIOD_TYPE_SELECT_OPTIONS },
]

export const useVatWorkItemsFilters = () => {
  const { searchParams, getParam, setFilter, setFilters, resetFilters, setSearchParams } = useSearchParamFilters()
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (searchParams.get('create') !== '1') return

    setShowCreateModal(true)
    const normalized = new URLSearchParams(searchParams)
    normalized.delete('create')
    setSearchParams(normalized, { replace: true })
  }, [searchParams, setSearchParams])

  const rawStatus = getParam('status')
  const rawYear = getParam('year') || String(getOperationalTaxYear())
  const filters: VatWorkItemsFilters = {
    status: isVatWorkItemStatus(rawStatus) ? rawStatus : '',
    year: rawYear === 'all' ? '' : rawYear,
    period_type: toVatPeriodTypeFilter(searchParams.get('period_type')),
    client_record_id: getParam('client_record_id'),
    client_name: getParam('client_name'),
  }

  return {
    filters,
    fields: useMemo(buildFilterFields, []),
    values: {
      client_record_id: filters.client_record_id,
      client_name: filters.client_name,
      year: filters.year || 'all',
      status: filters.status,
      period_type: filters.period_type,
    },
    onChange: setFilter,
    onMultiChange: setFilters,
    onReset: resetFilters,
    createModal: {
      open: showCreateModal,
      initialClientId: Number(searchParams.get('client_id')) || undefined,
      initialPeriod: searchParams.get('period') ?? undefined,
      openModal: useCallback(() => setShowCreateModal(true), []),
      closeModal: useCallback(() => setShowCreateModal(false), []),
    },
  }
}
