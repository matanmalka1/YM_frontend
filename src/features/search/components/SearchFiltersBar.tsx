import { RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import { Button } from '../../../components/ui/primitives/Button'
import { CLIENT_STATUS_OPTIONS, ENTITY_TYPE_OPTIONS } from '@/features/clients'
import { BINDER_STATUS_OPTIONS } from '../../binders'
import { SEARCH_ADVANCED_FILTER_KEYS, type SearchFiltersBarProps } from '../types'

const withEmptyOption = (label: string, options: { value: string; label: string }[]) => [
  { value: '', label },
  ...options,
]

export const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  isOpen,
  onToggle,
}) => {
  const advancedCount = SEARCH_ADVANCED_FILTER_KEYS.filter((k) => Boolean(filters[k])).length

  return (
    <div>
      <Button type="button" variant="ghost" size="sm" onClick={onToggle} className="text-gray-600 hover:text-gray-900">
        <SlidersHorizontal className="h-4 w-4" />
        פילטרים מתקדמים
        {advancedCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
            {advancedCount}
          </span>
        )}
        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {isOpen && (
        <div className="mt-3 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              label="שם לקוח"
              type="text"
              value={filters.client_name}
              onChange={(e) => onFilterChange('client_name', e.target.value)}
              placeholder="שם לקוח"
            />
            <Input
              label="ת.ז / ח.פ"
              type="text"
              value={filters.id_number}
              onChange={(e) => onFilterChange('id_number', e.target.value)}
              placeholder="מספר מזהה"
            />
            <Input
              label="מספר קלסר"
              type="text"
              value={filters.binder_number}
              onChange={(e) => onFilterChange('binder_number', e.target.value)}
              placeholder="לדוגמה: 12345"
            />
            <Select
              label="סטטוס לקוח"
              value={filters.client_status}
              onChange={(e) => onFilterChange('client_status', e.target.value)}
              options={withEmptyOption('כל הסטטוסים', CLIENT_STATUS_OPTIONS)}
            />
            <Select
              label="סוג עסק"
              value={filters.entity_type}
              onChange={(e) => onFilterChange('entity_type', e.target.value)}
              options={withEmptyOption('כל הסוגים', ENTITY_TYPE_OPTIONS)}
            />
            <Select
              label="סטטוס קלסר"
              value={filters.binder_status}
              onChange={(e) => onFilterChange('binder_status', e.target.value)}
              options={withEmptyOption('כל הסטטוסים', BINDER_STATUS_OPTIONS)}
            />
          </div>

          {advancedCount > 0 && onReset && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-xs text-gray-500">{advancedCount} פילטרים פעילים</span>
              <Button type="button" variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                איפוס הכל
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
