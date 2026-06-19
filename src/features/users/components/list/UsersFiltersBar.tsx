import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { USER_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import type { UsersFilters } from '../../types'

interface UsersFiltersBarProps {
  filters: UsersFilters
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

const FIELDS = [
  {
    type: 'search' as const,
    key: 'search',
    label: 'חיפוש משתמש',
    placeholder: USER_SEARCH_PLACEHOLDER,
  },
  {
    type: 'select' as const,
    key: 'is_active',
    label: 'סטטוס',
    options: [
      { value: '', label: 'כל המשתמשים' },
      { value: 'true', label: 'פעילים בלבד' },
      { value: 'false', label: 'לא פעילים' },
    ],
  },
]

export const UsersFiltersBar: React.FC<UsersFiltersBarProps> = ({ filters, onFilterChange, onReset }) => (
  <FilterPanel
    fields={FIELDS}
    values={{ search: filters.search ?? '', is_active: filters.is_active ?? '' }}
    onChange={onFilterChange}
    onReset={onReset}
    gridClass="grid-cols-1 sm:grid-cols-2"
  />
)
