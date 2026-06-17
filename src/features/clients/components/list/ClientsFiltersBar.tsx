import { useMemo } from 'react'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import {
  CLIENT_SORT_BY_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  DEFAULT_CLIENT_SORT_BY,
  DEFAULT_CLIENT_SORT_ORDER,
  ENTITY_TYPE_OPTIONS,
  getClientSortOrderOptions,
} from '../../constants'
import type { ClientsFiltersBarProps } from '../../types'
import { useAdvisorOptions } from '@/features/users'
import { ALL_STATUSES_OPTION } from '@/constants/filterOptions.constants'
import { CLIENT_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import type { FilterBadge } from '@/components/ui/table/ActiveFilterBadges'

const STATUS_OPTIONS = [ALL_STATUSES_OPTION, ...CLIENT_STATUS_OPTIONS]

export const ClientsFiltersBar: React.FC<ClientsFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  showAccountantFilter = false,
}) => {
  const { options: advisorOptions, nameById } = useAdvisorOptions(showAccountantFilter)
  const activeAccountantId = filters.accountant_id ? String(filters.accountant_id) : ''

  const fields = useMemo(
    () => [
      {
        type: 'search' as const,
        key: 'search',
        label: 'חיפוש לקוח',
        placeholder: CLIENT_SEARCH_PLACEHOLDER,
      },
      { type: 'select' as const, key: 'status', label: 'סטטוס', options: STATUS_OPTIONS },
      {
        type: 'select' as const,
        key: 'entity_type',
        label: 'סוג יישות',
        options: [{ value: '', label: 'כל הסוגים' }, ...ENTITY_TYPE_OPTIONS],
      },
      ...(showAccountantFilter
        ? [
            {
              type: 'select' as const,
              key: 'accountant_id',
              label: 'רואה חשבון',
              options: [{ value: '', label: 'כל רואי החשבון' }, ...advisorOptions],
            },
          ]
        : []),
      {
        type: 'select' as const,
        key: 'sort_by',
        label: 'מיון לפי',
        options: CLIENT_SORT_BY_OPTIONS,
        defaultValue: DEFAULT_CLIENT_SORT_BY,
      },
      {
        type: 'select' as const,
        key: 'order',
        label: 'כיוון מיון',
        options: getClientSortOrderOptions(filters.sort_by),
        defaultValue: DEFAULT_CLIENT_SORT_ORDER,
      },
    ],
    [showAccountantFilter, advisorOptions, filters.sort_by],
  )

  const extraBadges: FilterBadge[] = activeAccountantId
    ? [
        {
          key: 'accountant_id',
          label: `רואה חשבון: ${nameById.get(Number(activeAccountantId)) ?? activeAccountantId}`,
          onRemove: () => onFilterChange('accountant_id', ''),
        },
      ]
    : []

  return (
    <FilterPanel
      fields={fields}
      values={{
        search: filters.search ?? '',
        status: filters.status ?? '',
        entity_type: filters.entity_type ?? '',
        accountant_id: activeAccountantId,
        sort_by: filters.sort_by ?? '',
        order: filters.order ?? '',
      }}
      onChange={(key, value) => onFilterChange(key as Parameters<typeof onFilterChange>[0], value)}
      onReset={onReset}
      gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      extraBadges={extraBadges}
    />
  )
}
